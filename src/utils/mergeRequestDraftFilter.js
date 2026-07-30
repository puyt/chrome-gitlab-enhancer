/**
 * @param {string} href
 * @param {boolean} draft
 * @returns {string}
 */
export function mergeRequestDraftFilterUrl(href, draft) {
    const url = new URL(href);

    url.searchParams.set('state', 'opened');
    url.searchParams.set('draft', draft ? 'yes' : 'no');
    url.searchParams.delete('page');
    url.searchParams.delete('page_after');
    url.searchParams.delete('page_before');

    return url.toString();
}
