# publish-release-with-notes
GitHub Action to publish a release with release notes

## Example

```
name: Example
on:
  push:
    tags:
      - '*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Get tag name
        id: tag
        run: echo "NAME=${GITHUB_REF/refs\/tags\//}" >> $GITHUB_OUTPUT

      - name: Checkout
        uses: actions/checkout@v2

      - name: Create GitHub release
        id: release
        uses: ncipollo/release-action@v1.14.0
        with:
          draft: true

      - name: Publish release with notes
        uses: cyosp/publish-release-with-notes@1.1.0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          id: ${{ steps.release.outputs.id }}
          version: ${{ steps.tag.outputs.NAME }}
          notes: ${{ github.workspace }}/release-notes.md
```
