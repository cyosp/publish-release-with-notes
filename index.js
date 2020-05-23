const {GitHub, context} = require('@actions/github');
const core = require('@actions/core');
const fs = require("fs");

async function run() {
    try {
        const github = new GitHub(process.env.GITHUB_TOKEN);
        const {owner, repo} = context.repo;

        const releaseId = core.getInput("id", {required: true});
        const releaseVersion = core.getInput("version", {required: true});
        const releaseNotesFilePath = core.getInput("notes", {required: true});

        const releaseNotesFileContent = fs.readFileSync(releaseNotesFilePath, 'utf8');
        let versionReleaseNotesRegex = new RegExp(
            `#####\\s+${releaseVersion.replace(/\./g, '\\.')}.*?\n([\\s\\S]*?)\n#####`
        );
        let versionReleaseNotesMatch = releaseNotesFileContent.match(versionReleaseNotesRegex);

        let versionReleaseNotes;
        if (versionReleaseNotesMatch) {
            versionReleaseNotes = versionReleaseNotesMatch[1];
        } else {
            versionReleaseNotesRegex = new RegExp(
                `#####\\s+${releaseVersion.replace(/\./g, '\\.')}.*?\n([\\s\\S]*)`
            );
            versionReleaseNotesMatch = releaseNotesFileContent.match(versionReleaseNotesRegex);
            if (versionReleaseNotesMatch) {
                versionReleaseNotes = versionReleaseNotesMatch[1];
            }
        }

        if (versionReleaseNotes) {
            versionReleaseNotes
                .trim()
                .replace(/\s*\n/g, '\n');
        }

        await github.repos.updateRelease({
            owner,
            repo,
            release_id: releaseId,
            body: versionReleaseNotes,
            draft: false
        });
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
