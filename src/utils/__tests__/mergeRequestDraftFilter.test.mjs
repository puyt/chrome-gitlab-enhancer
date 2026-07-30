import assert from 'node:assert/strict';
import test from 'node:test';
import { mergeRequestDraftFilterUrl } from '../mergeRequestDraftFilter.js';

test('builds ready and draft merge request URLs without pagination', () => {
    const currentUrl = 'https://gitlab.example/group/project/-/merge_requests?assignee_username=me&page=3';

    assert.equal(
        mergeRequestDraftFilterUrl(currentUrl, false),
        'https://gitlab.example/group/project/-/merge_requests?assignee_username=me&state=opened&draft=no',
    );
    assert.equal(
        mergeRequestDraftFilterUrl(currentUrl, true),
        'https://gitlab.example/group/project/-/merge_requests?assignee_username=me&state=opened&draft=yes',
    );
});
