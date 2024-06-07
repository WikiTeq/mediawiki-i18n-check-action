# Mediawiki Extension I18N Checker

The action is a [composite action](https://docs.github.com/en/actions/creating-actions/creating-a-composite-action)
that will confirm that a [MediaWiki](https://mediawiki.org) extension documents
the uses of all of its internationalization strings, and defines the strings
that are used implicitly.

It makes use of:

* [actions/checkout](https://github.com/actions/checkout)
* [actions/setup-node](https://github.com/actions/setup-node)

At the moment, it does not support validation for [skins](https://www.mediawiki.org/wiki/Help:Skins).

# Usage

```yaml
- uses: wikiteq/mediawiki-i18n-check-action@main
  with:
    extension: DummyExtension
```

# Inputs

* `extension` - extension name to test (this should match the desired extension directory)

# Example

The below is an example of how to setup your GitHub Actions workflow on extension repository:

`.github/workflows/main.yml`

```yaml
name: Example

on:
  push:
    branches: [ master ]
  pull_request:
    branches: [ "*" ]

jobs:
  i18n-check:
    name: I18n check
    runs-on: ubuntu-latest
    steps:
      - name: I18n check action
        uses: wikiteq/mediawiki-i18n-check-action@main
        with:
          extension: MyExtension
```
