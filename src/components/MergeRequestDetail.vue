<template>
    <div style="display: flex;">
        <teleport
            v-if="isShowMyUnresolvedEnabled && teleportElement"
            :to="teleportElement"
        >
            <div
                v-if="isShowMyUnresolvedWithResponsesEnabled && myUnresolveThreadsWithResponses.length"
                class="gl-pl-4 gl-rounded-base gl-min-h-7 gl-bg-blue-100 gl-mr-3 has-tooltip"
                style="display: flex; align-items: center;"
                title="Unresolved threads created by me with responses"
            >
                <SvgIcon
                    class="gl-icon gl-mr-3"
                    :path="mdiCommentTextMultipleOutline"
                />

                <span>{{ myUnresolveThreadsWithResponses.length }}</span>

                <div class="gl-ml-3 btn-group">
                    <button
                        class="btn discussion-previous-btn gl-rounded-base! btn-default btn-md gl-button btn-default-tertiary btn-icon"
                        style="padding: 8px 4px;"
                        title="Go to my previous unresolved thread with a response"
                        @click.prevent="scrollToUnresolvedWithResponse(-1)"
                    >
                        <SvgIcon
                            class="gl-button-icon"
                            :is-gitlab="true"
                            :path="gSvgChevronUp"
                        />
                    </button>

                    <button
                        class="btn discussion-previous-btn gl-rounded-base! btn-default btn-md gl-button btn-default-tertiary btn-icon"
                        style="padding: 8px 4px;"
                        title="Go to my next unresolved thread with a response"
                        @click.prevent="scrollToUnresolvedWithResponse(+1)"
                    >
                        <SvgIcon
                            class="gl-button-icon"
                            :is-gitlab="true"
                            :path="gSvgChecronDown"
                        />
                    </button>
                </div>
            </div>

            <div
                v-if="myUnresolvedDomIds.length"
                class="gl-pl-4 gl-rounded-base gl-min-h-7 gl-bg-red-100 gl-mr-3 has-tooltip"
                style="display: flex; align-items: center;"
                title="Unresolved threads created by me"
            >
                <SvgIcon
                    class="gl-icon gl-mr-3"
                    :path="mdiCommentAccountOutline"
                />

                <span>{{ myUnresolvedThreads.length }}</span>

                <div class="gl-ml-3 btn-group">
                    <button
                        class="btn discussion-previous-btn gl-rounded-base! btn-default btn-md gl-button btn-default-tertiary btn-icon"
                        style="padding: 8px 4px;"
                        title="Go to my previous unresolved thread"
                        @click.prevent="scrollToMyUnresolved(-1)"
                    >
                        <SvgIcon
                            class="gl-button-icon"
                            :is-gitlab="true"
                            :path="gSvgChevronUp"
                        />
                    </button>

                    <button
                        class="btn discussion-previous-btn gl-rounded-base! btn-default btn-md gl-button btn-default-tertiary btn-icon"
                        style="padding: 8px 4px;"
                        title="Go to my next unresolved thread"
                        @click.prevent="scrollToMyUnresolved(+1)"
                    >
                        <SvgIcon
                            class="gl-button-icon"
                            :is-gitlab="true"
                            :path="gSvgChecronDown"
                        />
                    </button>
                </div>
            </div>
        </teleport>
    </div>
</template>

<script
    lang="ts"
    setup
>
    import {
        mdiCommentAccountOutline,
        mdiCommentTextMultipleOutline,
    } from '@mdi/js';
    import { useFetch } from '@vueuse/core';
    import { debounce } from 'lodash-es';
    import {
        computed,
        nextTick,
        onBeforeUnmount,
        onMounted,
        type Ref,
        ref,
        type ShallowRef,
        shallowRef,
    } from 'vue';
    import {
        gSvgChecronDown,
        gSvgChevronUp,
    } from '../assets/icons';
    import { useFetchPaging } from '../composables/useFetchPaging';
    import { useThreadsByDefault } from '../composables/useThreadsByDefault';
    import { Preference } from '../enums';
    import { useExtensionStore } from '../store';
    import type { GitLabDiscussion } from '../types';
    import SvgIcon from './SvgIcon.vue';

    interface Props {
        iid?: number,
        currentProjectPath?: string,
        csrfToken?: string,
    }

    const {
        iid = 0,
        currentProjectPath = '',
        csrfToken = '',
    } = defineProps<Props>();

    useThreadsByDefault();

    const {
        gitlabUserId,
        getSetting,
    } = useExtensionStore();

    const mrData = shallowRef<any>(null);

    const teleportElement: Ref<HTMLElement | null> = ref(null);
    const discussions: ShallowRef<GitLabDiscussion[]> = shallowRef([]);

    const isShowMyUnresolvedWithResponsesEnabled = computed(() => !!getSetting(Preference.MR_SHOW_MY_UNRESOLVED_THREADS_WITH_RESPONSES, true));
    const isShowMyUnresolvedEnabled = computed(() => !!getSetting(Preference.MR_SHOW_MY_UNRESOLVED_THREADS, true));

    async function fetchMrDiscussions() {
        if (!iid || !isShowMyUnresolvedEnabled.value) {
            return;
        }

        const { data } = await useFetchPaging(`/api/v4/projects/${encodeURIComponent(currentProjectPath)}/merge_requests/${iid}/discussions`);
        discussions.value = data?.value || [] as GitLabDiscussion[];

        render();
    }

    const debouncedFetchMrDiscussions = debounce(async () => {
        await fetchMrDiscussions();
    }, 300);

    function markAsViewed(event: KeyboardEvent) {
        // Skip if input is focused.
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || (event.target instanceof HTMLElement && event.target.isContentEditable)) {
            return;
        }

        const elements = document.querySelectorAll('.diff-files-holder .vue-recycle-scroller');
        if (elements.length) {
            return;
        }

        const viewedCheckboxLabelElement = document.querySelector('.diff-files-holder .file-actions input[type="checkbox"] + label') as HTMLLabelElement;
        if (viewedCheckboxLabelElement) {
            const inputId = viewedCheckboxLabelElement.getAttribute('for') || '';
            viewedCheckboxLabelElement?.click();

            document.getElementById(inputId)
                ?.blur();
        }
    }

    function markAsViewedAndOpenNext(event: KeyboardEvent) {
        // Skip if input is focused.
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || (event.target instanceof HTMLElement && event.target.isContentEditable)) {
            return;
        }

        markAsViewed(event);

        setTimeout(() => {
            document.querySelector('.diff-files-holder .gl-pagination [data-testid="nextButton"]')?.click();
        }, 300);
    }

    function handleKeyPress(event: KeyboardEvent) {
        if (!event.shiftKey && event.key == 'v' && getSetting(Preference.MR_HOTKEY_VIEWED, true)) {
            markAsViewed(event);
        }

        if (event.shiftKey && event.key === 'J' && getSetting(Preference.MR_HOTKEY_VIEWED_NEXT, true)) {
            markAsViewedAndOpenNext(event);
        }
    }

    async function fetchMR() {
        if (!iid) {
            return;
        }

        const url = `/api/v4/projects/${encodeURIComponent(currentProjectPath)}/merge_requests/${iid}?is_custom=1`;

        const { data } = await useFetch(url)
            .json();

        mrData.value = data.value;
    }

    async function updateReviewers(ids: number[]) {
        if (!iid) {
            return;
        }

        await useFetch(`/api/v4/projects/${encodeURIComponent(currentProjectPath)}/merge_requests/${iid}`, {
            headers: { 'X-CSRF-TOKEN': csrfToken },
        })
            .put({ reviewer_ids: ids });

        await nextTick();
        addAssignYourselfButton();
    }


    function addAssignYourselfButton() {
        if (!getSetting(Preference.MR_SHOW_ASSIGN_YOURSELF, true)) {
            return;
        }

        const reviewerIds = mrData?.value?.reviewers.map((reviewer: any) => reviewer.id) || [];

        const isAssigned = reviewerIds.includes(gitlabUserId);
        const newReviewerIds = isAssigned ? reviewerIds.filter((id: number) => id !== gitlabUserId) : [
            ...reviewerIds,
            gitlabUserId,
        ];

        const hasExistingButton = document.querySelector('[data-testid="assign-yourself"]');
        hasExistingButton?.remove();

        const assignYourselfDiv = document.createElement('div');
        assignYourselfDiv.setAttribute('data-testid', 'assign-yourself');
        assignYourselfDiv.innerHTML = `<button class="btn gl-ml-2 btn-link btn-md gl-button btn-link-tertiary">
            <span class="gl-button-text">
                <span class="gl-text-subtle hover:gl-text-blue-800">
                    ${isAssigned ? 'unassign' : 'assign'} yourself
                </span>
            </span>
        </button>`;

        assignYourselfDiv.addEventListener('click', () => updateReviewers(newReviewerIds));

        const blockReviewer = document.querySelector('.block.reviewer .reviewers-dropdown');
        if (blockReviewer && blockReviewer.parentElement) {
            blockReviewer.parentElement.insertBefore(assignYourselfDiv, blockReviewer);
        }
    }

    async function deleteSourceBranch() {
        if (!mrData.value) {
            return;
        }

        const projectId = mrData.value.source_project_id || mrData.value.project_id;
        const sourceBranch = mrData.value.source_branch;

        if (!projectId || !sourceBranch) {
            return;
        }

        const confirmed = window.confirm(`Delete source branch "${sourceBranch}"? This cannot be undone!`);
        if (!confirmed) {
            return;
        }

        try {
            const endpoint = `/api/v4/projects/${encodeURIComponent(projectId)}/repository/branches/${encodeURIComponent(sourceBranch)}`;

            await useFetch(endpoint, { headers: { 'X-CSRF-TOKEN': csrfToken } })
                .delete();

            const btnEl = document.getElementById('glab-enhancer-browser-extension__delete-source-branch-btn') as HTMLButtonElement | null;
            if (btnEl) {
                btnEl.setAttribute('disabled', 'true');
                btnEl.textContent = 'Deleted';
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Failed to delete source branch', error);
            window.alert('Failed to delete source branch. See console for details.');
        }
    }

    async function fetchBranch(projectId: number | string, branchName: string) {
        if (!projectId || !branchName) {
            return null;
        }

        const endpoint = `/api/v4/projects/${encodeURIComponent(projectId)}/repository/branches/${encodeURIComponent(branchName)}`;
        try {
            const { data } = await useFetch(endpoint)
                .json();

            return data.value || null;
        } catch (e) {
            return null;
        }
    }

    async function addRemoveSourceBranchButton() {
        if (!mrData.value || mrData.value.state !== 'closed') {
            return;
        }

        const projectId = mrData.value.source_project_id || mrData.value.project_id;
        const sourceBranch = mrData.value.source_branch;
        if (!projectId || !sourceBranch) {
            return;
        }

        const branchObj = await fetchBranch(projectId, sourceBranch);
        if (!branchObj) {
            return;
        }

        const buttonEl = document.createElement('button');
        buttonEl.id = 'glab-enhancer-browser-extension__delete-source-branch-btn';
        buttonEl.className = 'gl-float-left gl-hidden @md/panel:gl-inline-flex btn gl-button btn-confirm btn-sm btn-confirm-tertiary js-remove-branch-button';
        buttonEl.innerHTML = `<span class="gl-button-text">Delete source branch</span>`;

        buttonEl.addEventListener('click', (e) => {
            e.preventDefault();
            deleteSourceBranch();
        });

        const targetEl = document.querySelector('.mr-widget-section .mr-widget-body .media-body + div');
        if (targetEl) {
            targetEl.appendChild(buttonEl);
        }
    }

    function render() {
        teleportElement.value?.remove();
        teleportElement.value = document.createElement('div');
        teleportElement.value.style.display = 'flex';

        const stickyElement = document.querySelector('.merge-request-sticky-header:not(.gl-visibility-hidden):not(.gl-invisible) .merge-request-tabs + div');
        if (stickyElement) {
            stickyElement.prepend(teleportElement.value);
            return;
        }

        const targetElement = document.querySelector('.merge-request-details .merge-request-tabs-container > div');
        targetElement?.prepend(teleportElement.value);
    }

    const debouncedRender = debounce(render, 400);

    onMounted(async () => {
        window.addEventListener('keydown', handleKeyPress);
        window.addEventListener('scroll', debouncedRender);

        window.addEventListener('message', (event) => {
            if (event.data.type === 'browser-request-completed' && !event.data.data.url.includes('is_custom=1')) {
                debouncedFetchMrDiscussions?.();
            }
        });

        nextTick(async () => {
            await fetchMR();

            addAssignYourselfButton();

            addRemoveSourceBranchButton();

            render();
        });

        debouncedFetchMrDiscussions?.();
    });

    onBeforeUnmount(() => {
        window.removeEventListener('keydown', handleKeyPress);
        window.removeEventListener('scroll', debouncedRender);
    });

    const myUnresolveThreadsWithResponses = computed(() => {
        return discussions.value.filter((discussion) => {
            const notes = (discussion?.notes || []).filter((note) => !note.system);

            const firstNote = notes?.[0] || null;
            const lastNote = notes?.[notes.length - 1] || null;

            const isMyThread = !!firstNote?.resolvable && !firstNote?.resolved && firstNote?.author?.id === gitlabUserId;
            const hasResponse = lastNote && !lastNote.system && lastNote.author.id !== gitlabUserId;

            return isMyThread && hasResponse;
        });
    });

    const selectedUnresolvedWithResponseIndex = ref(-1);
    const myUnresolvedWithResponseDomIds = computed(() => {
        return myUnresolveThreadsWithResponses.value.map((item) => {
            return `note_${item?.notes?.[0]?.id}`;
        });
    });

    function scrollToUnresolvedWithResponse(adjustment: number) {
        if (selectedUnresolvedWithResponseIndex.value === -1) {
            selectedUnresolvedWithResponseIndex.value = adjustment > 0 ? 0 : myUnresolveThreadsWithResponses.value.length - 1;
        } else {
            selectedUnresolvedWithResponseIndex.value = (selectedUnresolvedWithResponseIndex.value + adjustment + myUnresolveThreadsWithResponses.value.length) % myUnresolveThreadsWithResponses.value.length;
        }

        const selectorId = myUnresolvedWithResponseDomIds.value[selectedUnresolvedWithResponseIndex.value];
        if (!selectorId) {
            return;
        }
        document.getElementById(selectorId)
            ?.scrollIntoView({ behavior: 'smooth' });
    }


    const myUnresolvedThreads = computed(() => {
        return discussions.value.filter((discussion) => {
            const thread = discussion?.notes?.[0] || null;

            return !!thread?.resolvable && !thread?.resolved && thread?.author?.id === gitlabUserId;
        });
    });

    const selectedUnresolvedIndex = ref(-1);
    const myUnresolvedDomIds = computed(() => {
        return myUnresolvedThreads.value.map((item) => {
            return `note_${item?.notes?.[0]?.id}`;
        });
    });

    function scrollToMyUnresolved(adjustment: number) {
        if (selectedUnresolvedIndex.value === -1) {
            selectedUnresolvedIndex.value = adjustment > 0 ? 0 : myUnresolvedThreads.value.length - 1;
        } else {
            selectedUnresolvedIndex.value = (selectedUnresolvedIndex.value + adjustment + myUnresolvedThreads.value.length) % myUnresolvedThreads.value.length;
        }

        const selectorId = myUnresolvedDomIds.value[selectedUnresolvedIndex.value];
        if (!selectorId) {
            return;
        }
        document.getElementById(selectorId)
            ?.scrollIntoView({ behavior: 'smooth' });
    }
</script>
