*NB: This information is still in draft form, and should not be relied upon to inform usage of or contribution to `cubing.js`.*

## Purpose of this document

This document serves to describe `cubing.js`'s approach to documentation in both practical and theoretical terms. Anyone looking to contribute either documentation or new features to `cubing.js` should consult this document.

## Documentation guidelines:

- Write API reference documentation inline using [TSDoc-formatted](https://tsdoc.org/) comments 
    - PR's lacking these comments will be considered incomplete
- PR's do *not* require contributor-generated usage tutorials - API Reference material is sufficient
- Writing draft documentation is better than writing none at all
- Documentation can and should begin immediately 
  - It is *much* easier to write documentation at the time of coding. Additionally, it is much easier to improve imperfect documentation than to write it from scratch.

## Documentation roadmap:

- Devs to create API reference for all new modules/features going forward (prevents growth of documentation backlog)
- Decide on documentation process and tooling
- Create library architecture overview, and create API reference for through backlog of undocumented modules/features (serves needs of experienced developers and contributors)
- Create tutorials/guides for how to apply the library in practice (serves needs of novice developers)

## Style Guidelines

- Technical references (ie, references to files, projects and tools) should be formatted as follows:
  - Use backticks \` when there is no accompanying link (eg, "`cubing.js` is a project which aims to...")
  - Omit backticks when there is an accompanying link (eg, "Make sure you have [node](https://nodejs.org/en/) installed before...")
  - Reasoning: Universal use of backticks disguises links, leading to confusing navigation
- Draft documentation should include the following disclaimer at the top of the document:
  - *NB: This information is still in draft form, and should not be relied upon to inform usage of or contribution to `cubing.js`.*

## Tooling (TBD)

Tooling for documentation is still being discussed among key contributors, and will be added to this section once finalised.

## Documentation process (TBD)

The documentation process for documentation is still being discussed among key contributors, and will be added to this section once finalised.