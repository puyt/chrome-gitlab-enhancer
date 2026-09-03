# UX Enhancer for GitLab

This is **not** an official GitLab project. It is a browser extension that enhances the GitLab interface.

Maximize productivity and streamline your workflow on GitLab with this browser extension!
This powerful extension introduces a suite of features specifically designed to optimize your GitLab interface, making issue tracking and merge request management more efficient and user-friendly.

[Chrome Web Store](https://chromewebstore.google.com/detail/ux-enhancer-for-gitlab/jkddbjinnohhgelaibifeapocefcgmeb?authuser=0&hl=nl) | [Mozilla Add-on](https://addons.mozilla.org/nl/firefox/addon/ux-enhancer-for-gitlab/) | [GitHub](https://github.com/puyt/ux-enhancer-for-gitlab)

## ⚠️ Notice

GitLab is slowly rolling out updates to its UI as part of the "work items" overhaul. Since this extension heavily depends on the DOM, some features might not function properly with the new UI.
I only have access to the GitLab version used at our company, so I might not catch every change. I'm working on fixing the broken features one by one and aim to maintain backwards compatibility, though I can't fully verify it.

## ✨ Features

**General**

- Enable/disable most of the features by toggling the preferences
- Move the close issue / merge request button to the right side to prevent accidental clicks
- Add dropdown for scoped labels in issues & merge requests
- Remember the applied filters in the overview

**Command panel**

- Render starred projects
- Move "Places" after "Frequently visited ..."
- Increased height to fill the screen

**To-Do list**

- Render project logos
- Render labels
- Receive web notifications for new To-Do items

**Issues**

- Star issue boards and access them in the command panel
- Highlight issues assigned to yourself
- Render project logos in issue overview & board when viewed in groups
- Use "Threads" in favor of "Comments" by default
- Show unresolved threads in the overview & detail
- Show unresolved threads **created by you**
- Show unresolved threads created by you **with responses**
- Validate incomplete issues in issue detail (e.g. missing iteration, weight, specific labels, ...)

**Merge Requests**

- Highlight your MRs
- Use "Threads" in favor of "Comments" by default
- Separate draft merge requests into their own tab
- Draft merge requests are visually dimmed, making them stand out less and helping you focus on ready-to-review items.
- Render project logos in group overviews
- Show unresolved threads in the overview & detail
- Show unresolved threads **created by you**
- Show unresolved threads created by you **with responses**
- Add hotkey `v` to toggle a changed file as "viewed"
- Add hotkey `Shift+J` to mark a changed file as "viewed" and go to next page

## ⚙️ Preferences

Click on the "UX Enhancer" dropdown to customize the settings:

![](assets/preview-preferences.png)

## 👀 Preview

![](assets/preview-command-panel.png)

![](assets/preview-mr-unresolved-2.png)

![](assets/preview-issue-validation.png)

![](assets/preview-issue-unresolved.png)

![](assets/preview-issue-unresolved-2.png)

## 🔔 Web Notifications

In order to make the web notifications work, you'll to set up the **GitLab Instance(s)** && [Personal Access Token(s)](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html) in the pop-up.

![web-notifications-settings.png](assets/web-notifications-settings.png)
