import { debounce } from 'lodash-es';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { Preference } from '../enums';
import { useExtensionStore } from '../store';
import { usePageDetectionStore } from '../stores';

export function useHighlightMyIssuesMrs() {
    const { getSetting } = useExtensionStore();
    const {
        isBoardPage,
        isDetailPage,
        isGroupPage,
        isIssuePage,
        isMergeRequestPage,
        isProjectPage,
    } = storeToRefs(usePageDetectionStore());

    const isOverviewPage = computed(() => (isProjectPage.value || isGroupPage.value) && !isDetailPage.value);
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

            if (isIssuePage.value && isOverviewPage.value) {
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

        if (isHighlightMyMrEnabled.value && isMergeRequestPage.value && isOverviewPage.value) {
            const avatarElements = document.querySelectorAll([
                `li.merge-request a[data-testid="issuable-author"][href$="/${username}"]`,
                `li.merge-request .issuable-authored a.author-link[href$="/${username}"]`,
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
