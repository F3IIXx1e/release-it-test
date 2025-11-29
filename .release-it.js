const __header_pattern__ = new RegExp(/^(:\w+:)\s+(\w+)\((\w+)\):\s+(.+)$/)

/**
 * @type {import('release-it').Config}
 */
module.exports = {
    git: {
        tagName: 'v${version}',
        commitMessage: ':bookmark: chore(release): release v${version} [skip ci]',
        assets: ['CHANGELOG.md'],
        requireCleanWorkingDir: false,
        // 只允许 main dev test 分支提交时执行
        requireBranch: ['main', 'dev', 'test']
    },
    npm: {
        publish: false
    },
    github: {
        release: true
    },
    plugins: {
        '@release-it/conventional-changelog': {
            // 在当前目录下生成的文件名称
            infile: 'CHANGELOG.md',
            // 显示在 changelog 顶部的标题
            header: '# 版本变更记录 - 由 release-it 自动生成',
            // 基础预设
            preset: {
                name: 'conventionalcommits',
                types: [
                    { type: 'feat', section: '✨ New Features | 功能新增' },
                    { type: 'fix', section: '🐛 Bug Fixes | 问题修复' },
                    { type: 'refactor', section: '♻️ Code Refactor | 代码重构' },
                    { type: 'perf', section: '⚡ Improve Performance | 性能优化' },
                    { type: 'revert', section: '⏪ Revert Changes | 版本回退' }
                ]
            },
            whatBump: commits => {
                let level = 2
                let breakings = 0
                let revert = 0
                let features = 0
                let bugfixes = 0

                commits.forEach((commit) => {
                    const match = __header_pattern__.exec(commit.header)
                    const commitType = match ? match[2] : undefined
                    if (commit.notes.length > 0) {
                        breakings += commit.notes.length
                        level = 0
                    }
                    else if (commitType === 'revert') {
                        revert += 1
                        level = 0
                    }
                    else if (commitType === 'feat') {
                        features += 1
                        if (level === 2) {
                            level = 1
                        }
                    }
                    else if (['fix','refactor','perf'].includes(commitType)) {
                        bugfixes += 1
                    }
                })

                return {
                    level,
                    reason: breakings === 1
                        ? `There is ${breakings} BREAKING CHANGE and ${features} features`
                        : `There are ${breakings} BREAKING CHANGES and ${features} features`
                }
            },
            writerOpts: {
                groupBy: 'scopeName',
                commitsSort: ['type', 'subject'],
                linkReferences: true,
                // 规定在 changelog 中显示的日期格式
                formatDate: date => {
                    const d = new Date(date)
                    const Y = d.getFullYear()
                    const M = String(d.getMonth() + 1).padStart(2, '0')
                    const D = String(d.getDate()).padStart(2, '0')
                    return `${Y}/${M}/${D}`
                },
                transform: commit => {
                    const internalCommit = { ...commit }
                    const [_, gitmoji, type, scope, subject] = __header_pattern__.exec(commit.header)
                    if (!['feat','fix','refactor','perf'].includes(type)) return false
                    // 对应 commitlint 配置中的 scopes
                    const scopes = [
                        ['root', ':file_folder: 根目录'],
                        ['web', ':laptop: 前端应用'],
                        ['server', ':gear: 后端应用'],
                        ['others', ':briefcase: 其他杂项']
                    ]
                    internalCommit.gitmoji = gitmoji
                    internalCommit.type = type
                    internalCommit.scope = scope
                    internalCommit.subject = subject
                    internalCommit.shortHash = String(internalCommit.hash).slice(0, 7)
                    const scopeEntries = Object.fromEntries(scopes)
                    internalCommit.scopeName = scopeEntries[scope] || scopeEntries['others']
                    return internalCommit
                },
                headerPartial: '## [{{version}}]{{~#if title}} {{title}}{{~/if}} - {{date}}\n',
                commitPartial: '- {{gitmoji}} {{subject}} {{~#if hash}} {{#if @root.linkReferences~}}([{{shortHash}}]({{~#if @root.repository}}{{~#if @root.host}}{{~@root.host}}/{{/if}}{{~#if @root.owner}}{{~@root.owner}}/{{/if}}{{~@root.repository}}/commit/{{hash}}{{~else}}{{~#if @root.repoUrl}}{{~@root.repoUrl}}/commit/{{hash}}{{~/if}}{{~/if}})){{~else}} {{~shortHash}}{{~/if}}{{~/if}}\n'
            }
        }
    }
}
