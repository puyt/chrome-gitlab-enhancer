<template>
    <div
        id="glab-enhancer-browser-extension__preferences"
        ref="rootPreferencesElement"
        :class="{
            'glab-enhancer-browser-extension__preferences--left': isNewUIEnabled,
        }"
        :style="{
            marginRight: `${offsetRight ? offsetRight + 16 : 0}px`,
        }"
    >
        <div class="dropdown b-dropdown gl-dropdown btn-group gl-display-block!">
            <button
                class="btn dropdown-toggle btn-default btn-md gl-button gl-dropdown-toggle"
                style="box-shadow: none; border-color: #e24329; border-width: 1px; padding: 0.25rem 0.5rem;"
                @click.prevent="isMenuVisible = !isMenuVisible"
            >
                <SvgLogo style="margin-right: 4px; width: 24px; height: 24px;" />

                <span class="gl-dropdown-button-text">UX Enhancer</span>

                <span class="badge gl-ml-2 badge-tier badge-pill gl-badge sm has-tooltip">
                    {{ Version }}
                </span>

                <SvgIcon
                    class="gl-ml-2"
                    :path="mdiChevronDown"
                />
            </button>

            <ul
                :class="{
                    'show': isMenuVisible,
                }"
                class="dropdown-menu"
                :style="{
                    width: '400px',
                }"
            >
                <div class="gl-dropdown-inner">
                    <div class="gl-dropdown-contents">
                        <div class="preferences__tabs">
                            <div
                                :class="{
                                    'preferences__tab--active': activeTab === 'preferences',
                                }"
                                class="preferences__tab"
                                @click.stop="activeTab = 'preferences'"
                            >
                                <SvgIcon
                                    class="s16"
                                    :path="mdiCogOutline"
                                />

                                <span>Preferences</span>
                            </div>

                            <div
                                :class="{
                                    'preferences__tab--active': activeTab === 'changelog',
                                }"
                                class="preferences__tab"
                                @click.stop="activeTab = 'changelog'"
                            >
                                <SvgIcon
                                    class="s16"
                                    :path="mdiScriptTextOutline"
                                />

                                <span>Changelog</span>
                            </div>
                        </div>

                        <div style="margin-top: 16px; padding-left: 8px; overflow-y: auto;">
                            <template v-if="activeTab === 'changelog'">
                                <div
                                    class="changelog-preview"
                                    style="margin-top: -16px;"
                                    v-html="changelogHtml"
                                />
                            </template>
                            <template v-else>
                                <template
                                    v-for="(preferences, group) in groupedPreferences"
                                    :key="group"
                                >
                                    <label class="gl-ml-3">{{ group }}</label>

                                    <template
                                        v-for="preference in preferences"
                                        :key="preference.key"
                                    >
                                        <li
                                            class="gl-dropdown-item"
                                            @click="onClickItem(preference)"
                                        >
                                            <button
                                                :class="{
                                                    'has-tooltip': !!preference.title,
                                                }"
                                                class="dropdown-item"
                                                :style="{
                                                    'flex-wrap': typeof preference.defaultValue === 'string' ? 'wrap': 'nowrap',
                                                }"
                                                :title="preference.title"
                                                @click.prevent
                                            >
                                                <SvgIcon
                                                    v-if="preference.icon"

                                                    :class="preference.iconClassName"
                                                    class="gl-mr-3"
                                                    :is-gitlab="preference.isGitlabIcon"
                                                    :path="preference.icon"
                                                    style="flex: 0 0 auto;"
                                                />

                                                <div class="gl-dropdown-item-text-wrapper">
                                                    <p class="gl-dropdown-item-text-primary">{{ preference.label }}</p>
                                                </div>

                                                <GToggle
                                                    v-if="typeof preference.defaultValue === 'boolean'"
                                                    :model-value="!!getSetting(preference.key, preference.defaultValue)"
                                                />

                                                <input
                                                    v-if="typeof preference.defaultValue === 'string'"

                                                    class="form-control gl-border-gray-200"
                                                    style="margin-left: 24px; margin-bottom: 8px;"
                                                    type="text"
                                                    :value="getSetting(preference.key, preference.defaultValue)"

                                                    @input="onInput(preference.key, $event)"
                                                >

                                                <input
                                                    v-if="typeof preference.defaultValue === 'number'"

                                                    class="form-control gl-border-gray-200"
                                                    style="margin-left: 24px; margin-bottom: 8px; width: 20%;"
                                                    type="number"
                                                    min="0"
                                                    :value="getSetting(preference.key, preference.defaultValue)"

                                                    @input="onInput(preference.key, $event)"
                                                >
                                            </button>
                                        </li>
                                    </template>
                                </template>
                            </template>
                        </div>

                        <footer>
                            <button
                                class="btn btn-small has-tooltip"
                                title="Project avatars & labels are stored in local storage to reduce API calls. This button clears that cache."
                                @click="clearCache()"
                            >
                                <SvgIcon
                                    :path="mdiDeleteOutline"
                                    style="margin-right: 4px;"
                                />

                                <span>Clear cache</span>
                            </button>

                            <a
                                href="https://github.com/puyt/ux-enhancer-for-gitlab"
                                style="color: var(--gray-dark);"
                                target="_blank"
                            >
                                <SvgIcon
                                    :path="mdiGithub"
                                    style="margin-right: 4px;"
                                />

                                <span>GitHub</span>
                            </a>
                        </footer>
                    </div>
                </div>
            </ul>
        </div>
    </div>
</template>

<script
    lang="ts"
    setup
>
    import {
        mdiAccountCheckOutline,
        mdiAccountCircleOutline,
        mdiCheckDecagramOutline,
        mdiChevronDown,
        mdiClockOutline,
        mdiCogOutline,
        mdiCommentAccountOutline,
        mdiCommentCheckOutline,
        mdiCommentTextMultipleOutline,
        mdiDeleteOutline,
        mdiEmoticonOutline,
        mdiFlagOutline,
        mdiFormTextbox,
        mdiGithub,
        mdiImageOutline,
        mdiKeyboardOutline,
        mdiLightbulbOffOutline,
        mdiMapMarkerOutline,
        mdiScriptTextOutline,
        mdiStarOutline,
        mdiTabPlus,
    } from '@mdi/js';
    import { onClickOutside } from '@vueuse/core';
    import showdown from 'showdown'; //eslint-disable-line
    import {
        onMounted,
        type Ref,
        ref,
    } from 'vue';
    import changelog from '../../CHANGELOG.md?raw'; //eslint-disable-line
    import Version from '../../VERSION?raw'; //eslint-disable-line
    import {
        gSvgComments,
        gSvgEpic,
        gSvgFilter,
        gSvgIteration,
        gSvgLabels,
        gSvgStar,
        gSvgWeight,
    } from '../assets/icons';
    import { DEFAULT_QUICK_REACTIONS } from '../constants';
    import { Preference } from '../enums';
    import { useExtensionStore } from '../store';
    import GToggle from './GToggle.vue';
    import SvgIcon from './SvgIcon.vue';
    import SvgLogo from './SvgLogo.vue';

    interface PreferenceItem {
        label: string;
        title: string;
        key: string;
        icon: string;
        isGitlabIcon: boolean;
        iconClassName: string;
        defaultValue: boolean | string | number;
    }

    const {
        getSetting,
        setSetting,
        clearCache,
    } = useExtensionStore();

    const rootPreferencesElement: Ref<HTMLElement | null> = ref(null);
    const isMenuVisible = ref(false);
    const activeTab = ref('preferences');

    const changelogHtml = (new showdown.Converter()).makeHtml(changelog);

    onClickOutside(rootPreferencesElement, () => {
        isMenuVisible.value = false;
    });

    const groupedPreferences: Record<string, Array<PreferenceItem>> = {
        'General': [
            {
                label: 'Scoped labels dropdown',
                title: 'Quickly change scoped labels in issues & merge requests',
                key: Preference.GENERAL_SCOPED_LABELS_DROPDOWN,
                icon: gSvgLabels,
                isGitlabIcon: true,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Persistent filters',
                title: 'Remember your filters, e.g. in issues & merge requests overviews',
                key: Preference.GENERAL_PERSISTENT_FILTERS,
                icon: gSvgFilter,
                isGitlabIcon: true,
                iconClassName: '',
                defaultValue: true,
            },
        ],
        'Command Panel': [
            {
                label: 'Show starred projects',
                title: '',
                key: Preference.COMMAND_PANEL_STARRED_PROJECTS,
                icon: mdiStarOutline,
                isGitlabIcon: false,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Move "Places" after "Frequently visited"',
                title: '',
                key: Preference.COMMAND_PANEL_MOVE_PLACES,
                icon: mdiMapMarkerOutline,
                isGitlabIcon: false,
                iconClassName: '',
                defaultValue: true,
            },
        ],
        'To-Do List': [
            {
                label: 'Render project logos',
                title: '',
                key: Preference.TODO_RENDER_PROJECT_LOGOS,
                icon: mdiImageOutline,
                isGitlabIcon: false,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Render labels',
                title: 'For issues & MRs',
                key: Preference.TODO_RENDER_LABELS,
                icon: gSvgLabels,
                isGitlabIcon: true,
                iconClassName: '',
                defaultValue: true,
            },
        ],
        'Issues': [
            {
                label: 'Star issue boards',
                title: 'Render starred issue boards in the commands panel',
                key: Preference.ISSUE_STAR_BOARDS,
                icon: gSvgStar,
                isGitlabIcon: true,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Highlight my issues',
                title: 'Highlighted with purple dashed border',
                key: Preference.ISSUE_HIGHLIGHT_MINE,
                icon: mdiAccountCircleOutline,
                isGitlabIcon: false,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Show # of my unresolved threads',
                title: '',
                key: Preference.ISSUE_SHOW_MY_UNRESOLVED_THREADS,
                icon: mdiCommentAccountOutline,
                isGitlabIcon: false,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Show # of my unresolved threads with responses',
                title: '',
                key: Preference.ISSUE_SHOW_MY_UNRESOLVED_THREADS_WITH_RESPONSES,
                icon: mdiCommentTextMultipleOutline,
                isGitlabIcon: false,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Use "Threads" in favor of "Comments" by default',
                title: '',
                key: Preference.ISSUE_USE_THREADS_BY_DEFAULT,
                icon: mdiCommentCheckOutline,
                isGitlabIcon: false,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Render project logos',
                title: 'In issue overview & board',
                key: Preference.ISSUE_RENDER_PROJECT_LOGO,
                icon: mdiImageOutline,
                isGitlabIcon: false,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Validate missing "Epic"',
                title: '',
                key: Preference.ISSUE_VALIDATE_MISSING_EPIC,
                icon: gSvgEpic,
                isGitlabIcon: true,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Validate missing "Milestone"',
                title: '',
                key: Preference.ISSUE_VALIDATE_MISSING_MILESTONE,
                icon: mdiFlagOutline,
                isGitlabIcon: false,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Validate missing "Iteration"',
                title: '',
                key: Preference.ISSUE_VALIDATE_MISSING_ITERATION,
                icon: gSvgIteration,
                isGitlabIcon: true,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Validate missing "Weight"',
                title: '',
                key: Preference.ISSUE_VALIDATE_MISSING_WEIGHT,
                icon: gSvgWeight,
                isGitlabIcon: true,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Validate missing "Estimated time"',
                title: '',
                key: Preference.ISSUE_VALIDATE_MISSING_TIME_ESTIMATE,
                icon: mdiClockOutline,
                isGitlabIcon: false,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Validate unresolved threads',
                title: '',
                key: Preference.ISSUE_VALIDATE_UNRESOLVED_THREADS,
                icon: gSvgComments,
                isGitlabIcon: true,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Required labels',
                title: 'Use comma separated values',
                key: Preference.ISSUE_REQUIRED_SCOPED_LABELS,
                icon: gSvgLabels,
                isGitlabIcon: true,
                iconClassName: '',
                defaultValue: '',
            },
            {
                label: 'Display project path in issue cards (board)',
                title: 'Select how many levels of the project path to display on issue cards',
                key: Preference.ISSUE_BOARDS_RENAME_PROJECT,
                icon: mdiFormTextbox,
                isGitlabIcon: false,
                iconClassName: '',
                defaultValue: 0,
            },
        ],
        'Epics': [
            {
                label: 'Show assignees on epic board cards',
                title: 'Render assignee avatars on epic board cards (mirrors issue board UI)',
                key: Preference.EPIC_BOARDS_SHOW_ASSIGNEES,
                icon: mdiAccountCircleOutline,
                isGitlabIcon: false,
                iconClassName: '',
                defaultValue: true,
            },
        ],
        'Merge Requests': [
            {
                label: 'Highlight my MRs',
                title: 'Highlighted with purple dashed border',
                key: Preference.MR_HIGHLIGHT_MINE,
                icon: mdiAccountCircleOutline,
                isGitlabIcon: false,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Highlight my approvals',
                title: 'Highlighted MRs approved by myself with blue background',
                key: Preference.MR_HIGHLIGHT_MY_APPROVALS,
                icon: mdiCheckDecagramOutline,
                isGitlabIcon: false,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Show # of my unresolved threads',
                title: '',
                key: Preference.MR_SHOW_MY_UNRESOLVED_THREADS,
                icon: mdiCommentAccountOutline,
                isGitlabIcon: false,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Show # of my unresolved threads with responses',
                title: '',
                key: Preference.MR_SHOW_MY_UNRESOLVED_THREADS_WITH_RESPONSES,
                icon: mdiCommentTextMultipleOutline,
                isGitlabIcon: false,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Show (un)assign yourself button',
                title: '',
                key: Preference.MR_SHOW_ASSIGN_YOURSELF,
                icon: mdiAccountCheckOutline,
                isGitlabIcon: false,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Use "Threads" in favor of "Comments" by default',
                title: '',
                key: Preference.MR_USE_THREADS_BY_DEFAULT,
                icon: mdiCommentCheckOutline,
                isGitlabIcon: false,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Render project logos',
                title: 'In MR overview',
                key: Preference.MR_RENDER_PROJECT_LOGO,
                icon: mdiImageOutline,
                isGitlabIcon: false,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Dim "Draft"',
                title: '',
                key: Preference.MR_DIM_DRAFT,
                icon: mdiLightbulbOffOutline,
                isGitlabIcon: false,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Separate drafts into their own tab',
                title: 'Keeps draft merge requests out of the Open tab',
                key: Preference.MR_SEPARATE_DRAFTS,
                icon: mdiTabPlus,
                isGitlabIcon: false,
                iconClassName: '',
                defaultValue: false,
            },
            {
                label: 'Hotkey mark as viewed',
                title: 'v',
                key: Preference.MR_HOTKEY_VIEWED,
                icon: mdiKeyboardOutline,
                isGitlabIcon: false,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Hotkey mark as viewed & open next file',
                title: 'Shift+J',
                key: Preference.MR_HOTKEY_VIEWED_NEXT,
                icon: mdiKeyboardOutline,
                isGitlabIcon: false,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Quick reactions',
                title: 'Comma separated emoji names to show on open threads, e.g. thumbsup,thumbsdown. Leave empty to disable.',
                key: Preference.MR_QUICK_REACTIONS,
                icon: mdiEmoticonOutline,
                isGitlabIcon: false,
                iconClassName: '',
                defaultValue: DEFAULT_QUICK_REACTIONS,
            },
        ],
    };

    function onInput(key: string, event: Event) {
        const target = event.target as HTMLInputElement;
        setSetting(key, target?.value || '');
    }

    function onClickItem(preference: PreferenceItem) {
        if (typeof preference.defaultValue !== 'boolean') {
            return;
        }

        setSetting(preference.key, !getSetting(preference.key, preference.defaultValue));
    }

    const isNewUIEnabled = document.querySelector('.page-with-panels') !== null;
    const offsetRight = ref(0);

    function calculateOffsetRight() {
        if (isNewUIEnabled) {
            return;
        }

        const topbarContainerElement = document.querySelector('.top-bar-container');
        if (!topbarContainerElement || topbarContainerElement.childElementCount <= 1) {
            return;
        }

        const offsetElements: NodeListOf<HTMLDivElement> = document.querySelectorAll('.top-bar-container > div:last-child > *, .top-bar-container > button');

        offsetElements.forEach((el) => {
            offsetRight.value += el.offsetWidth;
        });
    }


    onMounted(() => {
        calculateOffsetRight();
    });
</script>

<style lang="scss">
    #glab-enhancer-browser-extension__preferences {
        position: fixed;
        z-index: 999;
        top: 7px;
        right: 16px;

        &.glab-enhancer-browser-extension__preferences--left {
            right: auto;
            left: 74px;

            ul.dropdown-menu {
                right: initial;
                left: 0;
            }
        }

        ul.dropdown-menu {
            right: 0;
            left: initial;
        }

        .btn-group {
            position: relative;
            display: inline-flex;
            vertical-align: middle;
        }

        .gl-dropdown-contents label:not(:first-child):not(:last-child) {
            margin-top: 16px;
        }

        .dropdown-item {
            flex-wrap: wrap;
            display: flex;
            justify-content: center;
        }

        .gl-dropdown-contents {
            flex-direction: column;
            display: flex;
            overflow: hidden;
        }

        .gl-dropdown-inner {
            max-height: 30rem;
        }

        footer {
            display: flex;
            align-items: center;
            justify-content: space-between;

            padding: 8px 16px 0 16px;

            border-top: 1px solid var(--gray-100);

            button {
                padding: 3px 5px;
            }
        }
    }

    .preferences__tabs {
        display: flex;
        padding: 0 8px;
    }

    .preferences__tab {
        display: flex;
        align-items: center;

        padding: 8px 16px;
        border-radius: 16px;

        &:hover {
            cursor: pointer;
            background-color: var(--secondary);
        }

        &.preferences__tab--active {
            color: #5943b6;
            background-color: #e1d8f9;
        }

        svg {
            margin-right: 8px;
        }

        & + & {
            margin-left: 8px;
        }
    }

    .changelog-preview {
        padding-left: 16px;
        color: var(--gray-dark);

        h1 {
            margin-top: 0;
            font-size: 28px;
        }

        h1#changelog {
            display: none !important;
        }

        h2 {
            font-size: 20px;
        }

        h3 {
            font-size: 16px;
        }

        ul {
            margin-left: 24px;
        }

        li {
            display: list-item;
            list-style: circle;

            a {
                display: inline;
                padding: 0 2px;
                color: #5943b6;
                text-decoration: underline;
                border-radius: 2px;
            }
        }
    }
</style>
