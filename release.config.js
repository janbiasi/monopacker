// @ts-check

module.exports = {
	branches: [
		{
			name: "master"
		},
		{
			name: "next",
			prerelease: "rc"
		}
	],
	plugins: [
		[
			"semantic-release/commit-analyzer",
			{
				preset: "angular",
				parserOpts: {
					noteKeywords: [
						"BREAKING CHANGE",
						"BREAKING CHANGES",
						"BREAKING"
					]
				}
			}
		],
		[
			"semantic-release/release-notes-generator",
			{
				preset: "angular",
				parserOpts: {
					"noteKeywords": [
						"BREAKING CHANGE",
						"BREAKING CHANGES",
						"BREAKING"
					]
				},
				writerOpts: {
					commitsSort: [
						"subject",
						"scope"
					]
				}
			}
		],
		[
			"@semantic-release/github",
			{
				assets: [
					{
						path: "build/**",
						label: "Bundle"
					},
					{
						path: "./*.MD",
						label: "Documentation"
					}
				]
			}
		],
		"@semantic-release/npm"
	]
}
