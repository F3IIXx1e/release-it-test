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
    },
    plugins: {
        '@release-it/conventional-changelog': {
            // 在当前目录下生成的文件名称
            infile: 'CHANGELOG.md',
            // CHANGELOG 顶部标题
            header: '# 版本变更记录 - 由 release-it 自动生成',
            preset: 'angular'
        }
    }
}
