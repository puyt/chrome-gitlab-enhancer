<template>
    <div>
        <teleport
            v-if="teleportElement"
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
                        class="btn discussion-previous-btn gl-rounded-base! gl-px-2! btn-default btn-md gl-button btn-default-tertiary btn-icon"
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
                        class="btn discussion-previous-btn gl-rounded-base! gl-px-2! btn-default btn-md gl-button btn-default-tertiary btn-icon"
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
                v-if="isShowMyUnresolvedEnabled && myUnresolvedThreads.length"
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
                        class="btn discussion-previous-btn gl-rounded-base! gl-px-2! btn-default btn-md gl-button btn-default-tertiary btn-icon"
                        style="padding: 8px 4px;"
                        title="Go to my previous unresolved thread"

                        @click.prevent="scrollToUnresolved(-1)"
                    >
                        <SvgIcon
                            class="gl-button-icon"
                            :is-gitlab="true"
                            :path="gSvgChevronUp"
                        />
                    </button>

                    <button
                        class="btn discussion-previous-btn gl-rounded-base! gl-px-2! btn-default btn-md gl-button btn-default-tertiary btn-icon"
                        style="padding: 8px 4px;"
                        title="Go to my next unresolved thread"

                        @click.prevent="scrollToUnresolved(+1)"
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
                v-if="unresolvedThreads.length"
                class="gl-pl-4 gl-rounded-base gl-min-h-7 gl-bg-orange-100 gl-mr-3 has-tooltip"
                style="display: flex; align-items: center;"
                title="Total unresolved threads"
            >
                <SvgIcon
                    class="gl-icon gl-mr-3"
                    :path="mdiCommentAlertOutline"
                />

                <span>{{ unresolvedThreads.length }}</span>

                <div class="gl-ml-3 btn-group">
                    <button
                        class="btn discussion-previous-btn gl-rounded-base! gl-px-2! btn-default btn-md gl-button btn-default-tertiary btn-icon"
                        style="padding: 8px 4px;"
                        title="Go to previous unresolved thread"

                        @click.prevent="scrollToUnresolved(-1)"
                    >
                        <SvgIcon
                            class="gl-button-icon"
                            :is-gitlab="true"
                            :path="gSvgChevronUp"
                        />
                    </button>

                    <button
                        class="btn discussion-previous-btn gl-rounded-base! gl-px-2! btn-default btn-md gl-button btn-default-tertiary btn-icon"
                        style="padding: 8px 4px;"
                        title="Go to next unresolved thread"

                        @click.prevent="scrollToUnresolved(+1)"
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
                v-if="filteredValidateStatuses.length > 0"
                class="dropdown b-dropdown gl-dropdown btn-group gl-display-block!"
                @mouseenter.prevent="isMenuVisible = true"
                @mouseleave.prevent="isMenuVisible = false"
            >
                <button
                    :class="{
                        'gl-font-weight-bold!': invalidCount,
                    }"
                    class="btn dropdown-toggle btn-default btn-md gl-button gl-dropdown-toggle gl-pl-3!"
                    :style="{
                        borderColor: !invalidCount ? 'var(--green-500)' : 'var(--red-500)',
                        color: !invalidCount ? 'var(--green-500)' : 'var(--red-500)',
                        backgroundColor: !invalidCount ? 'var(--green-100)' : 'var(--red-100)',
                    }"
                    style="box-shadow: none; border-width: 1px;"
                >
                    <SvgIcon
                        class="gl-mr-3"
                        :path="!invalidCount ?  mdiCheckCircleOutline : mdiMinusCircle"
                        :style="{
                            fill: !invalidCount ? '#108548': '#dd2b0e',
                        }"
                    />

                    <span class="gl-dropdown-button-text">
                        {{ !invalidCount ? 'Valid' : 'Incomplete' }}

                        <span
                            v-if="invalidCount"
                            class="badge gl-ml-2 badge-danger badge-pill gl-badge sm"
                            style="background-color: #ae1800; color: #fdd4cd;"
                        >
                            {{ invalidCount }}
                        </span>
                    </span>

                    <SvgIcon
                        v-if="false"
                        class="gl-ml-1"
                        :path="mdiChevronDown"
                    />
                </button>

                <ul
                    :class="{
                    'show': isMenuVisible,
                }"
                    class="dropdown-menu"
                    style="right: 0; left: initial; width: auto; min-width: 0;"
                >
                    <div class="gl-dropdown-inner">
                        <div class="gl-dropdown-contents">
                            <template
                                v-for="status in filteredValidateStatuses"
                                :key="status.key"
                            >
                                <li class="gl-dropdown-item">
                                    <button class="dropdown-item">
                                        <div
                                            class="gl-dropdown-item-text-wrapper"
                                            style="display: flex; justify-content: center;"
                                        >
                                            <span
                                                :class="{
                                                    'badge-success': status.isValid,
                                                    'badge-danger': !status.isValid,
                                                }"
                                                class="badge badge-pill gl-badge lg"
                                            >
                                                <SvgIcon
                                                    class="gl-badge-icon gl-ml-1 gl-mr-3"
                                                    :is-gitlab="status.isGitlabIcon"
                                                    :path="status.icon"
                                                />

                                                {{ status.label }}
                                            </span>
                                        </div>
                                    </button>
                                </li>
                            </template>
                        </div>
                    </div>
                </ul>
            </div>
        </teleport>
    </div>
</template>

<script
    lang="ts"
    setup
>
    import {
        mdiCheckCircleOutline,
        mdiChevronDown,
        mdiClockOutline,
        mdiCommentAccountOutline,
        mdiCommentAlertOutline,
        mdiCommentTextMultipleOutline,
        mdiFlagTriangle,
        mdiMinusCircle,
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
        shallowRef,
        type ShallowRef,
    } from 'vue';
    import {
        gSvgChecronDown,
        gSvgChevronUp,
        gSvgComments,
        gSvgEpic,
        gSvgIteration,
        gSvgLabels,
        gSvgWeight,
    } from '../assets/icons';
    import { useFetchPaging } from '../composables/useFetchPaging';
    import { useThreadsByDefault } from '../composables/useThreadsByDefault';
    import { Preference } from '../enums';
    import { useExtensionStore } from '../store';
    import type {
        GitLabDiscussion,
        GitlabIssue,
    } from '../types';
    import SvgIcon from './SvgIcon.vue';

    interface Props {
        iid?: number,
        currentProjectPath?: string,
    }

    const {
        iid = 0,
        currentProjectPath = '',
    } = defineProps<Props>();

    useThreadsByDefault();

    const {
        gitlabUserId,
        getSetting,
    } = useExtensionStore();

    const isMenuVisible = ref(false);
    const teleportElement: Ref<HTMLElement | null> = ref(null);

    const issue: ShallowRef<GitlabIssue | null> = shallowRef(null);
    const discussions: ShallowRef<GitLabDiscussion[]> = shallowRef([]);

    const isShowMyUnresolvedWithResponsesEnabled = computed(() => !!getSetting(Preference.ISSUE_SHOW_MY_UNRESOLVED_THREADS_WITH_RESPONSES, true));
    const isShowMyUnresolvedEnabled = computed(() => !!getSetting(Preference.ISSUE_SHOW_MY_UNRESOLVED_THREADS, true));
    const unresolvedThreads = computed(() => discussions.value.filter((discussion) => {
        const thread = discussion?.notes?.[0] || null;
        return !!thread?.resolvable && !thread?.resolved;
    }));
    const myUnresolvedThreads = computed(() => unresolvedThreads.value.filter((discussion) => discussion?.notes?.[0]?.author?.id === gitlabUserId));
    const myUnresolveThreadsWithResponses = computed(() => myUnresolvedThreads.value.filter((discussion) => {
        const notes = (discussion?.notes || []).filter((note) => !note.system);

        const firstNote = notes?.[0] || null;
        const lastNote = notes?.[notes.length - 1] || null;

        const isMyThread = !!firstNote?.resolvable && !firstNote?.resolved && firstNote?.author?.id === gitlabUserId;
        const hasResponse = lastNote && !lastNote.system && lastNote.author.id !== gitlabUserId;

        return isMyThread && hasResponse;
    }));
    const validateStatuses = computed(() => {
        const statuses = [
            {
                key: Preference.ISSUE_VALIDATE_MISSING_EPIC,
                label: 'Epic',
                icon: gSvgEpic,
                isGitlabIcon: true,
                isValid: issue.value?.epic !== null ? 1 : 0,
            },
            {
                key: Preference.ISSUE_VALIDATE_MISSING_MILESTONE,
                label: 'Milestone',
                icon: mdiFlagTriangle,
                isGitlabIcon: false,
                isValid: issue.value?.milestone !== null ? 1 : 0,
            },
            {
                key: Preference.ISSUE_VALIDATE_MISSING_ITERATION,
                label: 'Iteration',
                icon: gSvgIteration,
                isGitlabIcon: true,
                isValid: issue.value?.iteration !== null ? 1 : 0,
            },
            {
                key: Preference.ISSUE_VALIDATE_MISSING_WEIGHT,
                label: 'Weight',
                icon: gSvgWeight,
                isGitlabIcon: true,
                isValid: issue.value?.weight !== null ? 1 : 0,
            },
            {
                key: Preference.ISSUE_VALIDATE_MISSING_TIME_ESTIMATE,
                label: 'Estimated time',
                icon: mdiClockOutline,
                isGitlabIcon: false,
                isValid: (issue.value?.time_stats?.time_estimate ?? 0) > 0 ? 1 : 0,
            },
            {
                key: Preference.ISSUE_VALIDATE_UNRESOLVED_THREADS,
                label: 'Unresolved threads',
                icon: gSvgComments,
                isGitlabIcon: true,
                isValid: unresolvedThreads.value.length === 0,
            },
        ];

        const requiredLabels = getSetting(Preference.ISSUE_REQUIRED_SCOPED_LABELS, '') as string;
        if (requiredLabels !== '') {
            const labels = requiredLabels.split(',');
            const labelStatuses = labels.map((requiredLabel) => {
                const trimmedLabel = requiredLabel.trim();

                return {
                    key: trimmedLabel as Preference,
                    label: `Label "${trimmedLabel}"`,
                    icon: gSvgLabels,
                    isGitlabIcon: true,
                    isValid: issue.value?.labels.some((label) => label.startsWith(trimmedLabel)) ? 1 : 0,
                };
            });

            statuses.push(...labelStatuses);
        }

        return statuses;
    });
    const filteredValidateStatuses = computed(() => validateStatuses.value.filter((status) => !!getSetting(status.key, true)));
    const invalidCount = computed(() => filteredValidateStatuses.value.filter((status) => !status.isValid).length);

    function render() {
        teleportElement.value?.remove();
        teleportElement.value = document.createElement('div');
        if (teleportElement.value) {
            teleportElement.value.classList.add('gl-ml-auto');
            teleportElement.value.style.display = 'flex';
        }

        const stickyElement = document.querySelector('.issue-sticky-header .issue-sticky-header-text, .work-item-sticky-header-text .shortcut-edit-wi-description');
        if (stickyElement) {
            if (stickyElement.classList.contains('shortcut-edit-wi-description')) {
                stickyElement.parentNode!.insertBefore(teleportElement.value, stickyElement);
            } else {
                stickyElement.append(teleportElement.value);
            }

            return;
        }

        const targetElement = document.querySelector('.issue-details .detail-page-header-actions, .work-item-view .disclosure-hierarchy + div + div') as HTMLDivElement | null;
        if (targetElement) {
            targetElement.style.marginLeft = 'auto';
            targetElement.prepend(teleportElement.value);

            if (targetElement.parentElement) {
                targetElement.parentElement.style.flexWrap = 'wrap';
            }
        }
    }

    const debouncedRender = debounce(render, 400);

    async function fetchIssue() {
        if (!iid) {
            return;
        }

        const { data } = await useFetch(`/api/v4/projects/${encodeURIComponent(currentProjectPath)}/issues/${iid}?is_custom=1`)
            .json();
        issue.value = data?.value || null as GitlabIssue | null;

        nextTick(() => render());
    }

    async function fetchIssueDiscussions() {
        if (!iid) {
            return;
        }

        const { data } = await useFetchPaging(`/api/v4/projects/${encodeURIComponent(currentProjectPath)}/issues/${iid}/discussions`);
        discussions.value = data?.value || [] as GitLabDiscussion[];
    }

    const debouncedFetchIssue = debounce(async () => {
        await fetchIssue();
    }, 300);
    const debouncedFetchIssueDiscussions = debounce(async () => {
        await fetchIssueDiscussions();
    }, 300);


    const selectedUnresolvedWithResponseIndex = ref(-1);

    function scrollToUnresolvedWithResponse(adjustment: number) {
        if (selectedUnresolvedWithResponseIndex.value === -1) {
            selectedUnresolvedWithResponseIndex.value = adjustment > 0 ? 0 : myUnresolveThreadsWithResponses.value.length - 1;
        } else {
            selectedUnresolvedWithResponseIndex.value = (selectedUnresolvedWithResponseIndex.value + adjustment + myUnresolveThreadsWithResponses.value.length) % myUnresolveThreadsWithResponses.value.length;
        }

        const selectorId = `note_${myUnresolveThreadsWithResponses.value?.[selectedUnresolvedWithResponseIndex.value]?.notes?.[0]?.id}`;
        document.getElementById(selectorId)
            ?.scrollIntoView({ behavior: 'smooth' });
    }


    const selectedUnresolvedIndex = ref(-1);

    function scrollToUnresolved(adjustment: number) {
        if (selectedUnresolvedIndex.value === -1) {
            selectedUnresolvedIndex.value = adjustment > 0 ? 0 : unresolvedThreads.value.length - 1;
        } else {
            selectedUnresolvedIndex.value = (selectedUnresolvedIndex.value + adjustment + unresolvedThreads.value.length) % unresolvedThreads.value.length;
        }

        const selectorId = `note_${unresolvedThreads.value?.[selectedUnresolvedIndex.value]?.notes?.[0]?.id}`;
        document.getElementById(selectorId)
            ?.scrollIntoView({ behavior: 'smooth' });
    }

    onMounted(() => {
        window.addEventListener('scroll', debouncedRender);
        window.addEventListener('message', (event) => {
            if (event.data.type === 'browser-request-completed'
                && !event.data.data.url.includes('is_custom=1')
                && !event.data.data.url.includes('realtime_changes')
                && event.data.data.method !== 'GET') {
                debouncedFetchIssue();
                debouncedFetchIssueDiscussions();
            }
        });

        debouncedFetchIssue();
        debouncedFetchIssueDiscussions();
    });

    onBeforeUnmount(() => {
        window.removeEventListener('scroll', debouncedRender);
    });
</script>

<style
    lang="scss"
    scoped
>
    .dropdown-menu {
        margin: 0;
        padding-top: 0.25rem;
        border: none;
    }

    .gl-dropdown-inner {
        max-height: 400px;

        border: 1px solid rgb(191, 191, 195);
        border-radius: 0.25rem;
    }

    .gl-dropdown-contents {
        flex-wrap: wrap;
        display: flex;
        justify-content: center;
        min-width: 360px;

        padding: 1rem;
        gap: 8px;
    }

    .gl-dropdown-item {
        padding: 0;

        .dropdown-item {
            padding: 0;
            pointer-events: none;

            .gl-dropdown-item-text-wrapper {
                margin: 0;
                padding: 0;
            }
        }
    }
</style>

