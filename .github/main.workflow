workflow "ESLint" {
  resolves = ["ESLint checks"]
  on = "push"
}

action "ESLint checks" {
  uses = "gimenete/eslint-action@1.0"
  secrets = ["GITHUB_TOKEN"]
}
