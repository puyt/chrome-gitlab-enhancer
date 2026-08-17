import { debounce } from 'lodash-es';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { Preference } from '../enums';
import { useExtensionStore } from '../store';
import { usePageDetectionStore } from '../stores';
import { useExtractProjectPaths } from './useExtractProjectPaths';

export function useRenderProjectAvatarIssues() {
    const {
        getSetting,
        getProject,
    } = useExtensionStore();

    const { extract: extractProjectPaths } = useExtractProjectPaths();
    const {
        isTodoPage,
        isIssuePage,
        isBoardPage,
        isMergeRequestPage,
        isGroupPage,
        isProjectPage,
    } = storeToRefs(usePageDetectionStore());

    const projectAvatars = {};

    const isInjectAvatarTodoEnabled = computed(() => !!getSetting(Preference.TODO_RENDER_PROJECT_LOGOS, true));
    const isInjectAvatarIssueEnabled = computed(() => !!getSetting(Preference.ISSUE_RENDER_PROJECT_LOGO, true));
    const isInjectAvatarMergeRequestEnabled = computed(() => !!getSetting(Preference.MR_RENDER_PROJECT_LOGO, true));

    function injectAvatar(projectPath: string) {
        const avatarUrl = projectAvatars[projectPath];
        if (!avatarUrl) {
            return;
        }

        const hrefFragment = `/${projectPath}/-/`;

        if (isInjectAvatarTodoEnabled.value && isTodoPage.value) {
            let targetElements = document.querySelectorAll(`ul.todos-list a.todo-target-link[href*="${hrefFragment}"]`);
            if (targetElements.length === 0) {
                targetElements = document.querySelectorAll(`ol[data-testid="todo-item-list"] li > a.gl-link[href*="${hrefFragment}"]`);
            }

            targetElements.forEach((targetElement) => {
                const parentElement = (targetElement.closest('li')?.children?.[0] || null) as HTMLElement | null;
                if (!parentElement) {
                    return;
                }

                const avatarElement = parentElement.querySelector('.glab-enhancer-browser-extension__project-avatar');

                if (avatarElement) {
                    return;
                }

                let injectElement: HTMLElement;
                if (!avatarUrl.includes('http')) {
                    injectElement = document.createElement('div');
                    injectElement.className = 'gl-avatar gl-avatar-identicon gl-avatar-s24 gl-avatar-identicon-bg6';
                    injectElement.textContent = avatarUrl;
                } else {
                    injectElement = document.createElement('img');
                    injectElement.setAttribute('src', avatarUrl);
                    injectElement.setAttribute('style', 'width: 24px;');
                }

                injectElement.classList.add('gl-mr-4', 'glab-enhancer-browser-extension__project-avatar');
                injectElement.style.alignItems = 'center';

                if (parentElement.children?.[0]?.getAttribute('type') === 'checkbox') {
                    injectElement.classList.add('gl-ml-4');
                    parentElement.append(injectElement);
                } else {
                    parentElement.prepend(injectElement);
                }

                parentElement.style.display = 'flex';
                parentElement.style.alignItems = 'center';
            });
        }

        if (isInjectAvatarIssueEnabled.value) {
            if (isIssuePage.value) {
                const targetElements = document.querySelectorAll(`li.issue a.issue-title-text[href*="${hrefFragment}"]`);
                targetElements.forEach((targetElement) => {
                    const parentElement = targetElement?.parentElement?.parentElement?.parentElement || null;
                    if (parentElement && !parentElement.children?.[0].classList.contains('glab-enhancer-browser-extension__project-avatar')) {
                        let injectElement: HTMLElement;
                        if (!avatarUrl.includes('http')) {
                            injectElement = document.createElement('div');
                            injectElement.className = 'gl-avatar gl-avatar-identicon gl-avatar-s24 gl-avatar-identicon-bg6';
                            injectElement.textContent = avatarUrl;
                        } else {
                            injectElement = document.createElement('img');
                            injectElement.setAttribute('src', avatarUrl);
                            injectElement.setAttribute('style', 'width: 24px;');
                        }

                        injectElement.classList.add('gl-mr-5', 'glab-enhancer-browser-extension__project-avatar');

                        parentElement.prepend(injectElement);
                        parentElement.style.alignItems = 'center';
                    }
                });
            }

            if (isBoardPage.value && avatarUrl.includes('http')) {
                let targetElements = document.querySelectorAll(`li.board-card button.board-item-path[title="${projectPath}"]`);
                if (targetElements.length === 0) {
                    // Backward compatibility with old GitLab structure
                    targetElements = document.querySelectorAll(`li.board-card span[title="${projectPath}"]`);
                }

                targetElements.forEach((targetElement) => {
                    if (targetElement.parentElement && targetElement.previousElementSibling) {
                        const imgElement = document.createElement('img');
                        imgElement.setAttribute('src', avatarUrl);
                        imgElement.setAttribute('style', 'width: 20px;');
                        imgElement.classList.add('glab-enhancer-browser-extension__project-avatar');

                        targetElement.parentElement.replaceChild(imgElement, targetElement.previousElementSibling);
                        targetElement.parentElement.style.display = 'flex';
                        targetElement.parentElement.style.alignItems = 'center';
                    }
                });
            }
        }

        if (isInjectAvatarMergeRequestEnabled.value && (isMergeRequestPage.value && (isGroupPage.value || isProjectPage.value))) {
            const targetElements = document.querySelectorAll(`.issuable-list .merge-request-title-text a[href*="${hrefFragment}"], .issuable-list .issue-title a[href*="${hrefFragment}"]`);

            targetElements.forEach((targetElement) => {
                const parentElement = targetElement?.closest('li') || null;

                if (parentElement && !parentElement.children?.[0].classList.contains('glab-enhancer-browser-extension__project-avatar')) {
                    let injectElement: HTMLElement;
                    if (!avatarUrl.includes('http')) {
                        injectElement = document.createElement('div');
                        injectElement.className = 'gl-avatar gl-avatar-identicon gl-avatar-s24 gl-avatar-identicon-bg6';
                        injectElement.textContent = avatarUrl;
                    } else {
                        injectElement = document.createElement('img');
                        injectElement.setAttribute('src', avatarUrl);
                        injectElement.setAttribute('style', 'width: 24px;');
                    }

                    injectElement.classList.add('gl-mr-4', 'glab-enhancer-browser-extension__project-avatar');

                    parentElement.prepend(injectElement);
                    parentElement.style.display = 'flex';
                    parentElement.style.alignItems = 'center';
                }
            });
        }
    }

    function injectAvatars() {
        const paths = extractProjectPaths();

        paths.forEach((path) => {
            getProject(path)
                .then((project) => {
                    projectAvatars[path] = project?.avatar_url || project?.name?.charAt(0) || null;

                    injectAvatar(path);
                });
        });
    }

    return {
        render: debounce(injectAvatars, 500),
    };
}
