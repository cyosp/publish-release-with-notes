const github = require('@actions/github');
const core = require('@actions/core');
const fs = require("fs");

async function run() {
    try {
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

        const {owner, repo} = github.context.repo;
        const octokit = github.getOctokit(core.getInput('token'));
        await octokit.request('PATCH /repos/' + owner + '/' + repo + '/releases/' + releaseId, {
            body: versionReleaseNotes,
            draft: false,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
