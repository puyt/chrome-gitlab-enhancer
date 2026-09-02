export interface GitlabUser {
    id: number;
    name: string;
    username: string;
    state: string;
    avatar_url: string;
    web_url: string;
}

export interface GitLabProject {
    id: number;
    description: string;
    name: string;
    name_with_namespace: string;
    path: string;
    path_with_namespace: string;
    default_branch: string;
    web_url: string;
    avatar_url: string;
    open_issues_count: number;
}

export interface GitLabMergeRequest {
    id: number;
    iid: number;
    project_id: number;
    title: string;
    description: string;
    state: string;
    created_at: string;
    updated_at: string;
    merged_by?: GitlabUser | null;
    merged_at?: string | null;
    source_branch: string;
    target_branch: string;
    web_url: string;
    source_project_id: number;
    target_project_id: number;
    user_notes_count: number;
    upvotes: number;
    downvotes: number;
    author: GitlabUser;
}

export interface GitlabMilestone {
    id: number;
    iid: number;
    project_id: number;
    title: string;
    description: string;
    state: string;
    due_date: string;
    created_at: string;
    updated_at: string;
}

interface GitlabIteration {
    id: number;
    title: string;
    description: string;
    start_date: string;
    due_date: string;
    state: string;
}

interface GitlabEpic {
    id: number;
    iid: number;
    title: string;
    description: string;
    state: string;
    created_at: string;
    updated_at: string;
}

export interface GitlabIssue {
    id: number;
    iid: number;
    project_id: number;
    title: string;
    description: string;
    state: string;
    created_at: string;
    updated_at: string;
    closed_at: string | null;
    closed_by: GitlabUser | null;
    labels: string[];
    milestone: GitlabMilestone | null;
    assignees: GitlabUser[];
    author: GitlabUser;
    type: string;
    weight: number | null,
    iteration: GitlabIteration | null;
    epic: GitlabEpic | null;
    time_stats: {
        time_estimate: number;
        total_time_spent: number;
        human_time_estimate: string | null;
        human_total_time_spent: string | null;
    } | null;
}

export interface GitLabDiscussion {
    id: string;
    individual_note: boolean;
    notes: GitLabDiscussionNote[];
}

export interface GitLabDiscussionNote {
    id: number;
    type: string;
    body: string;
    author: GitlabUser;
    created_at: string;
    updated_at: string;
    system: boolean;
    noteable_id: number;
    noteable_type: string;
    project_id: number;
    resolvable: boolean;
    resolved: boolean;
    resolved_by?: GitlabUser | null;
    resolved_at: string | null;
    confidential: boolean;
    internal: boolean;
    noteable_iid: number;
    commands_changes: Record<string, any>;
}

export interface GitLabAwardEmoji {
    id: number;
    name: string;
    user: GitlabUser;
    created_at: string;
    updated_at: string;
    awardable_id: number;
    awardable_type: string;
}
