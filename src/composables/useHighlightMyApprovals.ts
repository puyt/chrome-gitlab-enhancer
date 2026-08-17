import {
    useFetch,
    watchDebounced,
} from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { shallowRef } from 'vue';
import { Preference } from '../enums';
import { useExtensionStore } from '../store';
import { usePageDetectionStore } from '../stores';
import { useExtractProjectPaths } from './useExtractProjectPaths';

export function useHighlightMyApprovals(gitlabUserId: number) {
    const { isMergeRequestPage } = storeToRefs(usePageDetectionStore());

    if (!gitlabUserId || !isMergeRequestPage.value) {
        return;
    }

    const { getSetting } = useExtensionStore();
    if (!getSetting(Preference.MR_HIGHLIGHT_MY_APPROVALS, true)) {
        return;
    }

    const { extract } = useExtractProjectPaths();

    const currentProjectPath = extract()?.[0];

    const iids = shallowRef<string[][]>([]);

    function extractIids() {
        const values: string[][] = [];

        document.querySelectorAll('.issuable-list > li .issuable-reference')
            .forEach((el) => {
                const iid = el.textContent?.trim()
                    ?.split('!') || [];

                if (iid.length > 0) {
                    values.push(iid);
                }
            });

        iids.value = values;
    }

    extractIids();

    function highlightMyApproval(projectPath: string, iid: string) {
        const url = `/api/v4/projects/${encodeURIComponent(projectPath)}/merge_requests/${iid}/approval_state?is_custom=1`;

        useFetch(url)
            .json()
            .then(({ data }) => {
                const isApproved = data.value.rules.some((rule) => rule.approved_by.some((user) => user.id === gitlabUserId));
                if (isApproved) {
                    const referenceEl = document.querySelector(`.issuable-list .issuable-main-info a[href="/${projectPath}/-/merge_requests/${iid}"]`);
                    const liEl = referenceEl?.closest('li');
                    const badge = liEl?.querySelector('[data-testid="mr-approvals"], [data-testid="mr-appovals"]');

                    if (badge && !badge.classList.contains('badge-success')) {
                        badge.classList.add('badge-info');
                    }
                }
            });
    }

    watchDebounced(() => iids.value, () => {
        iids.value.forEach(([projectPath, iid]) => {
            highlightMyApproval(projectPath || currentProjectPath, iid);
        });
    }, {
        immediate: true,
        debounce: 300,
    });
}
