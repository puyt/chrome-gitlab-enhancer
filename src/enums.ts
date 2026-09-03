export const enum Preference {
    COMMAND_PANEL_STARRED_PROJECTS = 'command_panel_starred_projects',
    COMMAND_PANEL_MOVE_PLACES = 'command_panel_move_places',

    TODO_RENDER_PROJECT_LOGOS = 'todo_render_project_logos',
    TODO_RENDER_LABELS = 'todo_render_labels',

    GENERAL_SCOPED_LABELS_DROPDOWN = 'general_scoped_labels_dropdown',
    GENERAL_PERSISTENT_FILTERS = 'general_persistent_filters',

    ISSUE_STAR_BOARDS = 'issue_star_boards',
    ISSUE_HIGHLIGHT_MINE = 'issue_highlight_mine',
    ISSUE_SHOW_MY_UNRESOLVED_THREADS = 'issue_show_my_unresolved_threads',
    ISSUE_SHOW_MY_UNRESOLVED_THREADS_WITH_RESPONSES = 'issue_show_my_unresolved_threads_with_responses',
    ISSUE_USE_THREADS_BY_DEFAULT = 'issue_use_threads_by_default',
    ISSUE_RENDER_PROJECT_LOGO = 'issue_render_project_logo',
    ISSUE_VALIDATE_MISSING_EPIC = 'issue_validate_missing_epic',
    ISSUE_VALIDATE_MISSING_MILESTONE = 'issue_validate_missing_milestone',
    ISSUE_VALIDATE_MISSING_ITERATION = 'issue_validate_missing_iteration',
    ISSUE_VALIDATE_MISSING_WEIGHT = 'issue_validate_missing_weight',
    ISSUE_VALIDATE_MISSING_TIME_ESTIMATE = 'issue_validate_missing_time_estimate',
    ISSUE_VALIDATE_UNRESOLVED_THREADS = 'issue_validate_unresolved_threads',
    ISSUE_REQUIRED_SCOPED_LABELS = 'issue_required_scoped_labels',
    ISSUE_BOARDS_RENAME_PROJECT = 'issue_boards_rename_project',

    EPIC_BOARDS_SHOW_ASSIGNEES = 'epic_boards_show_assignees',

    MR_HIGHLIGHT_MINE = 'mr_highlight_mine',
    MR_HIGHLIGHT_MY_APPROVALS = 'mr_highlight_my_approvals',
    MR_SHOW_ASSIGN_YOURSELF = 'mr_show_assign_yourself',
    MR_SHOW_MY_UNRESOLVED_THREADS = 'mr_show_my_unresolved_threads',
    MR_SHOW_MY_UNRESOLVED_THREADS_WITH_RESPONSES = 'mr_show_my_unresolved_threads_with_responses',
    MR_USE_THREADS_BY_DEFAULT = 'mr_use_threads_by_default',
    MR_RENDER_PROJECT_LOGO = 'mr_render_project_logo',
    MR_DIM_DRAFT = 'mr_dim_draft',
    MR_SEPARATE_DRAFTS = 'mr_separate_drafts',
    MR_HOTKEY_VIEWED = 'mr_hotkey_viewed',
    MR_HOTKEY_VIEWED_NEXT = 'mr_hotkey_viewed_next',
    MR_QUICK_REACTIONS = 'mr_quick_reactions',
}

export const enum PageType {
    // Dashboard pages
    DASHBOARD_ISSUES = 'dashboard_issues',
    DASHBOARD_MERGE_REQUESTS = 'dashboard_merge_requests',
    DASHBOARD_TODOS = 'dashboard_todos',

    // Project pages
    PROJECT_ISSUES = 'project_issues',
    PROJECT_ISSUE_DETAIL = 'project_issue_detail',
    PROJECT_MERGE_REQUESTS = 'project_merge_requests',
    PROJECT_MERGE_REQUEST_DETAIL = 'project_merge_request_detail',
    PROJECT_BOARDS = 'project_boards',
    PROJECT_PIPELINES = 'project_pipelines',

    // Group pages
    GROUP_ISSUES = 'group_issues',
    GROUP_MERGE_REQUESTS = 'group_merge_requests',
    GROUP_BOARDS = 'group_boards',
    GROUP_EPIC_BOARDS = 'group_epic_boards',

    // Other pages
    UNKNOWN = 'unknown',
}

export const enum BrowserMessageType {
    BROWSER_REQUEST_COMPLETED = 'browser-request-completed',
}

export const enum MittEventKey {
    GRAPHQL_REQUEST_COMPLETED = 'graphql-request-completed',
    BROWSER_REQUEST_COMPLETED = 'browser-request-completed',
}
