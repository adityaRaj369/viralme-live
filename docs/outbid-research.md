# Outbid.lol research → MakeMeViral direction

## Product (researched live)

**outbid.lol** is a public **pay-to-rank** leaderboard.

| Mechanic | Behavior |
|---|---|
| Rank signal | Amount paid only — no votes, likes, views |
| Claim #1 | Current #1 bid + bump ($5); whole dollars |
| Raise | Pay the difference to a higher total |
| Boards | **All-time** (cumulative) · **Today** (UTC day) · Daily archive |
| Categories | Filter pills on one board (All, SEO, Marketing, …) |
| Input | Product URL or X `@handle` |
| Analytics | Clicks shown on cards; never affect rank |

Tagline: “Claim a rank on the public leaderboard.”

## UI (live homepage)

- Narrow centered column
- Coral accent on cream (light) or charcoal (dark toggle)
- Category pill row → All-time/Today toggle
- Hero: `Claim #1 for − $N +` stepper + URL field + Claim button
- Vertical rank cards: logo · `#N` title · description · meta (category · age · domain · clicks) · bid amount
- “claim this rank for $X” badge on #1

## MakeMeViral mapping

| Outbid | MakeMeViral |
|---|---|
| Bid total | `Listing.rankAmount` |
| Today board | `todayRankAmount` + `todayRankDate` |
| Claim payment | `OrderType.RANK_CLAIM` → `fulfillRankClaim` |
| Homepage | `/` leaderboard + `ClaimRankBox` + `RankCard` |
| Explore | `/trending`, `/categories`, profile plans still secondary |

Theme: dark charcoal + coral accent (branded variant of outbid’s coral UI).
