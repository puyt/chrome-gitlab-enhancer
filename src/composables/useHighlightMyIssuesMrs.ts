import { debounce } from 'lodash-es';
import { useExtensionStore } from '../store';
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { Preference } from '../enums';
import { usePageDetectionStore } from '../stores';

export function useHighlightMyIssuesMrs() {
    const { getSetting } = useExtensionStore();
    const {
        isBoardPage,
        isIssuePage,
        isMergeRequestPage,
        isProjectPage,
    } = storeToRefs(usePageDetectionStore());

    const isHighlightMyIssueEnabled = computed(() => !!getSetting(Preference.ISSUE_HIGHLIGHT_MINE, true));
    const isHighlightMyMrEnabled = computed(() => !!getSetting(Preference.MR_HIGHLIGHT_MINE, true));

    function highlight(username: string) {
        if (!username) {
            return;
        }

        if (isHighlightMyIssueEnabled.value) {
            if (isBoardPage.value) {
                const cardElements = document.querySelectorAll(`.board-card a[href="/${username}"]`);
                cardElements.forEach((element) => {
                    const parentElement = element.closest('li.board-card') as HTMLElement | null;

                    if (parentElement?.style) {
                        parentElement.style.border = '2px dashed #5943b6';
                    }
                });
            }

            if (isIssuePage.value && isProjectPage.value) {
                const avatarElements = document.querySelectorAll([
                    `li.issue a[data-testid="issuable-author"][href$="/${username}"]`,
                    `.issuable-meta a.gl-avatar-link[href$="/${username}"]`,
                ].join(', '));
                avatarElements.forEach((element) => {
                    const parentElement = element.closest('li.issue') as HTMLElement | null;

                    if (parentElement?.style) {
                        parentElement.style.border = '2px dashed #5943b6';
                        parentElement.style.borderRadius = '0.25rem';
                        parentElement.style.margin = '0.5rem';
                    }
                });
            }
        }

        if (isHighlightMyMrEnabled.value && isMergeRequestPage.value && isProjectPage.value) {
            const avatarElements = document.querySelectorAll([
                `li.merge-request a[data-testid="issuable-author"][href$="/${username}"]`,
                `.issuable-info-container li:not(.issuable-reviewers) a.author-link[href$="/${username}"]`,
            ].join(', '));
            avatarElements.forEach((element) => {
                const parentElement = element.closest('li.merge-request') as HTMLElement | null;

                if (parentElement?.style) {
                    parentElement.style.border = '2px dashed #5943b6';
                    parentElement.style.borderRadius = '0.25rem';
                    parentElement.style.margin = '0.5rem';
                }
            });
        }
    }

    return {
        highlight: debounce(highlight, 500),
    };
}
