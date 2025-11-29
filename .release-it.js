/**
 * @type {import('release-it').Config}
 */
module.exports = {
    git: {
        tagName: 'v${version}',
        commitMessage: ':bookmark: chore(release): release v${version} [skip ci]',
        assets: ['CHANGELOG.md']
    },
    npm: {
        publish: false
    },
    github: {
        release: false
    }
}
