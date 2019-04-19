workflow "ESLint" {
  resolves = ["Annotated ESLint"]
  on = "check_suite"
}

action "Annotated ESLint" {
  uses = "rkusa/eslint-action@1.0.0"
  secrets = ["GITHUB_TOKEN"]
}
