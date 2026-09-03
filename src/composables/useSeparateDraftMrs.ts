import { debounce } from 'lodash-es';
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
import {
    PageType,
    Preference,
} from '../enums';
import { useExtensionStore } from '../store';
import { usePageDetectionStore } from '../stores';
import { mergeRequestDraftFilterUrl } from '../utils/mergeRequestDraftFilter';

const DRAFT_TAB_ID = 'glab-enhancer-drafts-tab';

function setActive(tab: HTMLElement, active: boolean) {
    tab.classList.toggle('active', active);

    const link = tab.querySelector('a');
    link?.classList.toggle('active', active);
    link?.classList.toggle('gl-tab-nav-item-active', active);
    link?.setAttribute('aria-selected', String(active));
    active ? link?.removeAttribute('tabindex') : link?.setAttribute('tabindex', '-1');
}

function navigate(draft: boolean, replace = false) {
    const url = mergeRequestDraftFilterUrl(window.location.href, draft);
    history[replace ? 'replaceState' : 'pushState'](history.state, '', url);
    window.dispatchEvent(new PopStateEvent('popstate', {
        state: history.state,
    }));
}

export function useSeparateDraftMrs() {
    const { getSetting } = useExtensionStore();
    const { pageType } = storeToRefs(usePageDetectionStore());

    function render() {
        const isMergeRequestList = [
            PageType.DASHBOARD_MERGE_REQUESTS,
            PageType.GROUP_MERGE_REQUESTS,
            PageType.PROJECT_MERGE_REQUESTS,
        ].includes(pageType.value);

        if (
            !getSetting(Preference.MR_SEPARATE_DRAFTS, false) ||
            !isMergeRequestList
        ) {
            return;
        }

        const stateTabs = document.querySelector('.issuable-state-filters');
        const openedTitle = stateTabs?.querySelector('[data-testid="opened-issuables-tab"]');
        const openedLink = (openedTitle?.closest('a') || stateTabs?.querySelector('a[href*="state=opened"]')) as HTMLAnchorElement | null;
        const openedTab = openedLink?.closest('li');

        if (!stateTabs || !openedLink || !openedTab) {
            return;
        }

        openedLink.href = mergeRequestDraftFilterUrl(window.location.href, false);

        if (!openedLink.dataset.glabEnhancerDraftFilter) {
            openedLink.dataset.glabEnhancerDraftFilter = 'true';
            openedLink.addEventListener('click', (event) => {
                if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
                    return;
                }

                event.preventDefault();
                event.stopImmediatePropagation();
                setActive(openedTab, true);
                const draftTab = document.getElementById(DRAFT_TAB_ID);
                if (draftTab) {
                    setActive(draftTab, false);
                }
                navigate(false);
            }, true);
        }

        let draftTab = document.getElementById(DRAFT_TAB_ID) as HTMLElement | null;
        if (!draftTab) {
            draftTab = openedTab.cloneNode(true) as HTMLElement;
            draftTab.id = DRAFT_TAB_ID;
            draftTab.querySelector('.gl-tab-counter-badge, .badge')?.remove();
            draftTab.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));

            const title = draftTab.querySelector('[data-testid="opened-issuables-tab"]') ||
                draftTab.querySelector('a span:not(.badge)');
            if (title) {
                title.textContent = 'Drafts';
                title.setAttribute('data-testid', 'drafts-issuables-tab');
                title.removeAttribute('title');
            }

            openedTab.insertAdjacentElement('afterend', draftTab);
        }

        const draftLink = draftTab.querySelector('a') as HTMLAnchorElement | null;
        if (!draftLink) {
            return;
        }

        draftLink.href = mergeRequestDraftFilterUrl(window.location.href, true);
        draftLink.removeAttribute('aria-controls');
        draftLink.removeAttribute('data-toggle');
        draftLink.removeAttribute('data-bs-toggle');

        if (!draftLink.dataset.glabEnhancerDraftTab) {
            draftLink.dataset.glabEnhancerDraftTab = 'true';
            draftLink.addEventListener('click', (event) => {
                if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
                    return;
                }

                event.preventDefault();
                setActive(openedTab, false);
                setActive(draftTab, true);
                navigate(true);
            });
        }

        const tabLinks = stateTabs.querySelectorAll('ul[role="tablist"] > li > a[role="tab"]');
        tabLinks.forEach((link, index) => {
            link.setAttribute('aria-setsize', String(tabLinks.length));
            link.setAttribute('aria-posinset', String(index + 1));
        });

        const currentUrl = new URL(window.location.href);
        const isOpenState = (currentUrl.searchParams.get('state') || 'opened') === 'opened';
        const isDraftTabActive =
            isOpenState &&
            currentUrl.searchParams.get('draft') === 'yes';

        setActive(openedTab, isOpenState && !isDraftTabActive);
        setActive(draftTab, isDraftTabActive);

        if (
            isOpenState &&
            !currentUrl.searchParams.has('draft')
        ) {
            navigate(false, true);
        }
    }

    onMounted(render);

    return {
        render: debounce(render, 300),
    };
}
