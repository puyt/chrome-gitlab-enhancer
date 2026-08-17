<template>
    <div>
        <div v-if="isShowMyUnresolvedEnabled">
            <template
                v-for="teleportId in teleportIds"
                :key="teleportId"
            >
                <teleport
                    v-if="teleportElements[teleportId]"
                    :to="`#${teleportId}`"
                >
                    <li
                        v-if="isShowMyUnresolvedWithResponsesEnabled && myUnresolvedThreadsWithResponseCount.get(teleportId)"
                        class="has-tooltip gl-display-none gl-sm-display-block md badge badge-pill gl-badge badge-info"
                        :style="{
                            color: 'var(--gl-badge-info-text-color-default) !important',
                            listStyle: 'none',
                        }"
                        title="My unresolved threads with responses"
                    >
                        <SvgIcon
                            class="gl-icon s16 gl-mr-2"
                            :path="mdiCommentTextMultipleOutline"
                            style="fill: currentColor;"
                        />

                        <span class="gl-font-weight-bold">{{ myUnresolvedThreadsWithResponseCount.get(teleportId) || 0 }}</span>
                    </li>

                    <li
                        :class="{
                            'badge badge-pill gl-badge badge-danger':  myUnresolvedThreadsCount.get(teleportId),
                        }"
                        class="has-tooltip gl-display-none gl-sm-display-block md"
                        :style="{
                            color: 'var(--gl-badge-danger-text-color-default) !important',
                            opacity: myUnresolvedThreadsCount.get(teleportId) ? 1 : 0.5,
                            listStyle: 'none',
                        }"
                        title="My unresolved threads"
                    >
                        <SvgIcon
                            class="gl-icon s16 gl-mr-2"
                            :path="mdiCommentAccountOutline"
                            style="fill: currentColor;"
                        />

                        <span class="gl-font-weight-bold">{{ myUnresolvedThreadsCount.get(teleportId) || 0 }}</span>
                    </li>

                    <li
                        :class="{
                            'badge badge-pill gl-badge badge-warning':  unresolvedThreadsCount.get(teleportId),
                        }"
                        class="has-tooltip gl-display-none gl-sm-display-block gl-mr-3 md"
                        :style="{
                            color: 'var(--gl-badge-warning-text-color-default) !important',
                            opacity: unresolvedThreadsCount.get(teleportId) ? 1 : 0.5,
                            listStyle: 'none',
                        }"
                        title="Unresolved threads"
                    >
                        <SvgIcon
                            class="gl-icon s16 gl-mr-2"
                            :path="mdiCommentAlertOutline"
                            style="fill: currentColor;"
                        />

                        <span class="gl-font-weight-bold">{{ unresolvedThreadsCount.get(teleportId) || 0 }}</span>
                    </li>
                </teleport>
            </template>
        </div>
    </div>
</template>

<script
    lang="ts"
    setup
>
    import {
        mdiCommentAccountOutline,
        mdiCommentAlertOutline,
        mdiCommentTextMultipleOutline,
    } from '@mdi/js';
    import { debounce } from 'lodash-es';
    import {
        computed,
        onBeforeUnmount,
        onMounted,
        ref,
        type Ref,
        shallowRef,
        type ShallowRef,
    } from 'vue';
    import { useFetchPaging } from '../composables/useFetchPaging';
    import { useMitt } from '../composables/useMitt';
    import {
        MittEventKey,
        Preference,
    } from '../enums';
    import { useExtensionStore } from '../store';
    import type { GitLabDiscussion } from '../types';
    import SvgIcon from './SvgIcon.vue';

    type IID = string | Array<string>;

    interface Props {
        currentProjectPath?: string,
        isMergeRequest?: boolean,
    }

    const {
        currentProjectPath = '',
        isMergeRequest = true,
    } = defineProps<Props>();

    const {
        gitlabUserId,
        getSetting,
    } = useExtensionStore();

    const {
        on,
        off,
    } = useMitt();

    const extractIssuableIds: ShallowRef<Array<IID>> = shallowRef([]);
    const discussions: Ref<Map<string, GitLabDiscussion[]>> = ref(new Map());

    function getProjectPath(iid: IID): string {
        return Array.isArray(iid) ? iid[0] : currentProjectPath;
    }

    function getIid(iid: IID): string {
        return Array.isArray(iid) ? iid[1] : iid;
    }

    function getTeleportId(idd: IID): string {
        return ('teleport-issuable-meta-' + getProjectPath(idd) + '-' + getIid(idd)).replace(/\//g, '_');
    }

    const isShowMyUnresolvedWithResponsesEnabled = computed(() => (isMergeRequest && !!getSetting(Preference.MR_SHOW_MY_UNRESOLVED_THREADS_WITH_RESPONSES, true) || (!isMergeRequest && !!getSetting(Preference.ISSUE_SHOW_MY_UNRESOLVED_THREADS_WITH_RESPONSES, true))));
    const isShowMyUnresolvedEnabled = computed(() => (isMergeRequest && !!getSetting(Preference.MR_SHOW_MY_UNRESOLVED_THREADS, true) || (!isMergeRequest && !!getSetting(Preference.ISSUE_SHOW_MY_UNRESOLVED_THREADS, true))));
    const teleportIds = computed(() => extractIssuableIds.value.map((iid) => getTeleportId(iid)));

    const teleportElements = computed(() => teleportIds.value.reduce((acc, teleportId) => {
        acc[teleportId] = document.getElementById(teleportId);
        return acc;
    }, {} as Record<string, HTMLElement | null>));

    const unresolvedThreadsCount = computed(() => {
        const items: Map<any, any> = new Map();

        extractIssuableIds.value.forEach((iid) => {
            const id = getIid(iid);
            const totalUnresolvedThreads = (discussions.value.get(id) || []).filter((discussion) => {
                const firstNote = discussion?.notes?.[0] || null;
                return !!firstNote?.resolvable && !firstNote?.resolved;
            });

            items.set(getTeleportId(iid), totalUnresolvedThreads.length);
        });

        return items;
    });

    const myUnresolvedThreadsCount = computed(() => {
        const items: Map<any, any> = new Map();

        extractIssuableIds.value.forEach((iid) => {
            const id = getIid(iid);
            const totalUnresolvedThreads = (discussions.value.get(id) || []).filter((discussion) => {
                const firstNote = discussion?.notes?.[0] || null;
                return !!firstNote?.resolvable && !firstNote?.resolved && firstNote?.author?.id === gitlabUserId;
            });

            items.set(getTeleportId(iid), totalUnresolvedThreads.length);
        });

        return items;
    });

    const myUnresolvedThreadsWithResponseCount = computed(() => {
        const items: Map<any, any> = new Map();

        extractIssuableIds.value.forEach((iid) => {
            const id = getIid(iid);
            const totalUnresolvedThreads = (discussions.value.get(id) || []).filter((discussion) => {
                const notes = (discussion?.notes || []).filter((note) => !note.system);

                const firstNote = notes?.[0] || null;
                const lastNote = notes?.[notes.length - 1] || null;

                const isMyThread = !!firstNote?.resolvable && !firstNote?.resolved && firstNote?.author?.id === gitlabUserId;
                const hasResponse = lastNote && !lastNote.system && lastNote.author.id !== gitlabUserId;

                return isMyThread && hasResponse;
            });

            items.set(getTeleportId(iid), totalUnresolvedThreads.length);
        });

        return items;
    });

    function fetchDiscussions(isForced: boolean = false) {
        extractIssuableIds.value.forEach((iid) => {
            const path = getProjectPath(iid);
            const id = getIid(iid);
            if (!id) {
                return;
            }

            if (!isForced && discussions.value.has(id)) {
                return;
            }

            const endpoint = `/api/v4/projects/${encodeURIComponent(path)}/${isMergeRequest ? 'merge_requests' : 'issues'}/${id}/discussions`;
            useFetchPaging(endpoint)
                .then(({ data }) => {
                    if (data?.value) {
                        discussions.value.set(id, data?.value || [] as GitLabDiscussion[]);
                    }
                });
        });
    }

    function extractIssuableIids() {
        const values: Array<string | Array<string>> = [];
        document.querySelectorAll('.issuable-list > li .issuable-reference, div[data-testid="merge-request-dashboard-tab"] div[data-testid="merge-request"] > div[role="cell"]:nth-child(2) > div:not([data-testid="labels-container"])')
            .forEach((el) => {
                const text = el.textContent || '';
                const regex = /^[\s\n]*([a-zA-Z0-9/_-]+)[!#](\d+)|[!#](\d+)/;
                const match = text.match(regex);

                let resolvedId: string | string[] = '';
                if (match) {
                    if (match[1] && match[2]) {
                        // Has explicit project path before ! or #
                        resolvedId = [
                            match[1],
                            match[2],
                        ];
                    } else if (match[3]) {
                        // Only an IID like #123 or !123
                        resolvedId = match[3];
                    }
                }

                values.push(resolvedId);

                // add teleport placeholder
                const containerElement = el.closest(isMergeRequest ? '.issuable-info-container, .issue, div[data-testid="merge-request"]' : 'li.issue');
                const metaElement = containerElement?.querySelector('li[data-testid="issuable-comments"], li:has(svg[data-testid="comments-icon"]), div[role="cell"] > div:has(svg[data-testid="comments-icon"])');

                const teleportId = getTeleportId(resolvedId);
                if (!document.getElementById(teleportId) && metaElement?.parentElement) {
                    const placeholderElement = document.createElement('div');
                    placeholderElement.style.display = 'flex';
                    placeholderElement.style.alignItems = 'center';
                    placeholderElement.style.gap = '4px';
                    placeholderElement.id = teleportId;
                    metaElement.parentElement.insertBefore(placeholderElement, metaElement.nextSibling);
                }
            });

        extractIssuableIds.value = values;

        fetchDiscussions();
    }

    const debouncedExtractIssuableIids = debounce(extractIssuableIids, 400);
    const debouncedForceFetchDiscussions = debounce(() => fetchDiscussions(true), 600);

    function onClickHandler(event: Event) {
        const targetEl = event.target as HTMLElement;
        if (targetEl.closest('.crud-header [data-testid="crud-collapse-toggle"]')) {
            debouncedExtractIssuableIids();
        }
    }

    function onBrowserRequestCompleted(data?: Record<string, any> | string | number) {
        debouncedExtractIssuableIids();

        if (typeof data === 'object' && data !== null && data['method'] !== 'GET') {
            debouncedForceFetchDiscussions();
        }
    }

    onMounted(() => {
        if (!isShowMyUnresolvedEnabled.value) {
            return;
        }

        if (document.querySelector('.crud-header [data-testid="crud-collapse-toggle"]')) {
            document.addEventListener('click', onClickHandler);
        }

        on(MittEventKey.BROWSER_REQUEST_COMPLETED, onBrowserRequestCompleted);
        debouncedExtractIssuableIids();
    });

    onBeforeUnmount(() => {
        off(MittEventKey.BROWSER_REQUEST_COMPLETED, onBrowserRequestCompleted);
        document.removeEventListener('click', onClickHandler);
    });
</script>
