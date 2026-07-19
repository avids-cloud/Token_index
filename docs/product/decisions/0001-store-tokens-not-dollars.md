# 1. Store tokens, never dollars

Date: 2026-07-18
Status: accepted

## Decision

The database stores token counts only. Dollar figures are computed at
display time from `data/model-pricing.json` and always shown with the date
the price was checked.

## Why

Prices change monthly; token counts do not. Storing dollars would silently
rot the entire dataset every time a provider changed pricing. Storing
tokens keeps every entry permanently useful and lets any entry be repriced
against any model.

## Consequences

The pricing file needs a monthly human refresh (Avi, against provider
pricing pages; never from memory). Every dollar figure on the site must
carry its `as_of` date. There is a unit test guarding the cost formula.
