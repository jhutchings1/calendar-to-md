workflow "ESLint" {
  resolves = ["Annotated ESLint"]
  on = "check_run"
}

action "Annotated ESLint" {
  uses = "rkusa/eslint-action@1.0.0"
}
