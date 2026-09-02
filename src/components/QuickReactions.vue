<template>
    <template
        v-for="target in quickReactionTargets"
        :key="target.noteId"
    >
        <teleport :to="target.container">
            <div class="glab-enhancer-browser-extension__quick-reactions">
                <button
                    v-for="button in target.buttons"
                    :key="button.emoji"

                    :class="{
                        'selected': button.isReacted,
                        'glab-enhancer-browser-extension__quick-reactions--inactive': !button.isReacted,
                    }"
                    class="gl-my-2 gl-mr-3 btn gl-button btn-default btn-md has-tooltip"
                    :title="button.title"
                    type="button"
                    @click.prevent="toggleReaction(target.noteId, button.emoji)"
                >
                    <span class="award-emoji-block">
                        <gl-emoji :data-name="button.emoji" />
                    </span>

                    <span class="gl-button-text">
                        <span class="js-counter">{{ button.isReacted ? 1 : 0 }}</span>
                    </span>
                </button>
            </div>
        </teleport>
    </template>
</template>

<script
    lang="ts"
    setup
>
    import {
        useFetch,
        useMutationObserver,
    } from '@vueuse/core';
    import { debounce } from 'lodash-es';
    import {
        computed,
        onBeforeUnmount,
        onMounted,
        type Ref,
        ref,
        type ShallowRef,
        shallowRef,
        watch,
    } from 'vue';
    import { useFetchPaging } from '../composables/useFetchPaging';
    import { useMitt } from '../composables/useMitt';
    import { DEFAULT_QUICK_REACTIONS } from '../constants';
    import {
        MittEventKey,
        Preference,
    } from '../enums';
    import { useExtensionStore } from '../store';
    import type {
        GitLabAwardEmoji,
        GitLabDiscussion,
    } from '../types';

    interface Props {
        currentProjectPath?: string,
        iid?: number,
        csrfToken?: string,
    }

    const {
        currentProjectPath = '',
        iid = 0,
        csrfToken = '',
    } = defineProps<Props>();

    const { getSetting } = useExtensionStore();

    const {
        on,
        off,
    } = useMitt();

    const discussions: ShallowRef<GitLabDiscussion[]> = shallowRef([]);

    const emojiNames = computed(() => (getSetting(Preference.MR_QUICK_REACTIONS, DEFAULT_QUICK_REACTIONS) as string)
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean));

    const isDiscussionsLoaded = ref(false);

    const openRootNoteIds = computed(() => new Set(discussions.value
        .map((discussion) => discussion.notes?.[0])
        .filter((note) => note && note.resolvable && !note.resolved && !note.system)
        .map((note) => note!.id)));

    function getDomThreadRootNoteIds(): Set<number> {
        const ids = new Set<number>();

        document.querySelectorAll('li.note-discussion, .discussion-notes')
            .forEach((thread) => {
                const rootNote = thread.querySelector('.note[id^="note_"]:not(.system-note)');
                const id = Number(rootNote?.id?.replace('note_', ''));

                if (id) {
                    ids.add(id);
                }
            });

        return ids;
    }

    function getNoteIds(): Set<number> {
        const domIds = getDomThreadRootNoteIds();

        if (!isDiscussionsLoaded.value) {
            return domIds;
        }

        return new Set(Array.from(domIds)
            .filter((id) => openRootNoteIds.value.has(id)));
    }

    const teleportContainers: Ref<Record<number, HTMLElement>> = ref({});
    const nativeEmojisByNote: Ref<Record<number, Set<string>>> = ref({});
    const reactions: Ref<Record<string, number>> = ref({});

    function getReactionKey(noteId: number, emoji: string) {
        return `${noteId}:${emoji}`;
    }

    /**
     * Every container we injected, with the buttons it should hold. Emojis GitLab
     * already renders natively are left out; its own award block handles those.
     */
    const quickReactionTargets = computed(() => Object.entries(teleportContainers.value)
        .map(([key, container]) => {
            const noteId = Number(key);

            const buttons = emojiNames.value
                .filter((emoji) => !nativeEmojisByNote.value[noteId]?.has(emoji))
                .map((emoji) => {
                    const isReacted = reactions.value[getReactionKey(noteId, emoji)] !== undefined;

                    return {
                        emoji,
                        isReacted,
                        title: isReacted ? `You reacted with :${emoji}:` : `React with :${emoji}:`,
                    };
                });

            return {
                noteId,
                container,
                buttons,
            };
        }));

    async function fetchDiscussions() {
        if (!iid || !emojiNames.value.length) {
            return;
        }

        const { data } = await useFetchPaging(`/api/v4/projects/${encodeURIComponent(currentProjectPath)}/merge_requests/${iid}/discussions`);
        discussions.value = data?.value || [];
        isDiscussionsLoaded.value = true;
    }

    function getNativeAwardEmojis(noteElement: HTMLElement): Set<string> {
        const names = new Set<string>();

        noteElement.querySelectorAll('.note-awards .js-awards-block [data-emoji-name]')
            .forEach((el) => {
                const name = el.getAttribute('data-emoji-name');
                if (name) {
                    names.add(name);
                }
            });

        return names;
    }

    function isSameEmojiSet(current: Set<string> | undefined, next: Set<string>) {
        return !!current && current.size === next.size && Array.from(next)
            .every((name) => current.has(name));
    }

    function render() {
        if (!emojiNames.value.length) {
            Object.values(teleportContainers.value)
                .forEach((container) => container.remove());
            teleportContainers.value = {};
            return;
        }

        const noteIds = getNoteIds();

        Object.keys(teleportContainers.value)
            .forEach((key) => {
                const noteId = Number(key);
                if (!noteIds.has(noteId) || !document.getElementById(`note_${noteId}`)) {
                    teleportContainers.value[noteId]?.remove();
                    delete teleportContainers.value[noteId];
                    delete nativeEmojisByNote.value[noteId];
                }
            });

        noteIds.forEach((noteId) => {
            const noteElement = document.getElementById(`note_${noteId}`);
            if (!noteElement) {
                return;
            }

            const nativeEmojis = getNativeAwardEmojis(noteElement);
            nativeEmojis.forEach((emoji) => {
                delete reactions.value[getReactionKey(noteId, emoji)];
            });

            if (!isSameEmojiSet(nativeEmojisByNote.value[noteId], nativeEmojis)) {
                nativeEmojisByNote.value[noteId] = nativeEmojis;
            }

            const existingContainer = teleportContainers.value[noteId];
            if (existingContainer && noteElement.contains(existingContainer)) {
                return;
            }

            existingContainer?.remove();

            const noteBody = noteElement.querySelector('.note-body');
            if (!noteBody) {
                return;
            }

            const container = document.createElement('div');
            container.style.display = 'inline-flex';
            container.style.verticalAlign = 'middle';
            container.style.marginTop = '16px';
            container.style.marginLeft = '4px';
            noteBody.appendChild(container);
            teleportContainers.value[noteId] = container;
        });
    }

    const debouncedRender = debounce(render, 300);

    async function toggleReaction(noteId: number, emoji: string) {
        const key = getReactionKey(noteId, emoji);
        const existingAwardId = reactions.value[key];
        const endpoint = `/api/v4/projects/${encodeURIComponent(currentProjectPath)}/merge_requests/${iid}/notes/${noteId}/award_emoji`;

        if (existingAwardId) {
            const {
                error,
                response,
            } = await useFetch(`${endpoint}/${existingAwardId}`, { headers: { 'X-CSRF-TOKEN': csrfToken } })
                .delete();

            if (!error.value || response.value?.status === 404) {
                delete reactions.value[key];
            }
        } else {
            const { data } = await useFetch(endpoint, { headers: { 'X-CSRF-TOKEN': csrfToken } })
                .post({ name: emoji })
                .json<GitLabAwardEmoji>();

            if (data.value?.id) {
                reactions.value[key] = data.value.id;
            }
        }
    }

    const debouncedFetchDiscussions = debounce(async () => {
        await fetchDiscussions();
        render();
    }, 300);

    function onBrowserRequestCompleted(data?: Record<string, any> | string | number) {
        if (typeof data === 'object' && data !== null && data['method'] !== 'GET') {
            debouncedFetchDiscussions();
        }
    }

    watch(emojiNames, () => {
        debouncedRender();
    });

    onMounted(() => {
        on(MittEventKey.BROWSER_REQUEST_COMPLETED, onBrowserRequestCompleted);

        useMutationObserver(document.body, debouncedRender, {
            childList: true,
            subtree: true,
        });

        render();

        fetchDiscussions()
            .then(render);
    });

    onBeforeUnmount(() => {
        off(MittEventKey.BROWSER_REQUEST_COMPLETED, onBrowserRequestCompleted);

        Object.values(teleportContainers.value)
            .forEach((container) => container.remove());
    });
</script>

<style lang="scss">
    .note-body:has(.glab-enhancer-browser-extension__quick-reactions) .note-awards {
        display: inline-flex;
        vertical-align: middle;
    }

    .glab-enhancer-browser-extension__quick-reactions {
        flex-wrap: wrap;
        display: inline-flex;
        vertical-align: middle;
    }

    .glab-enhancer-browser-extension__quick-reactions--inactive {
        opacity: 0.7;
        filter: grayscale(1);

        &:hover {
            opacity: 1;
            filter: none;
        }
    }
</style>
