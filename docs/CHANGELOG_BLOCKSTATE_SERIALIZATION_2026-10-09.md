# Block State serialization / type correction — 2026-10-09

## Runtime evidence used

Minecraft Education 26.32 was tested through three separate command paths, and
Bedrock chat/.mcfunction was cross-checked with the same result:

- Minecraft chat: block-state array accepts `"key"=value`.
- Behavior Pack `.mcfunction`: block-state array accepts `"key"=value`.
- MakeCode `player.execute()`: the same block-state array requires `"key":value`.
- `player.execute()` accepted `open_bit:true` and rejected `open_bit:1` for the
  tested lever command.

Whitespace around block-state separators is intentionally omitted by both
serializers so the only syntax difference is `=` vs `:`.

## Architecture

The AST remains the Source of Truth and stores the actual value kind:

- string
- number
- boolean

Canonical `.mcfunction` compilation uses compact `=` syntax, for example:

```mcfunction
["lever_direction"="up_north_south","open_bit"=true]
```

MakeCode Runtime Preview uses a Preview-only compatibility serializer, for
example:

```text
["lever_direction":"up_north_south","open_bit":true]
```

The Preview serializer is applied only to structured block commands that
contain block states. It does not change the canonical Compiler output.

## Library corrections

The common Boolean state reporters now create Boolean AST values rather than
numeric 0/1 values, including `open_bit`, `button_pressed_bit`, `powered_bit`,
`triggered_bit`, `in_wall_bit`, `upside_down_bit`, `door_hinge_bit`, and
`upper_block_bit`.

Unknown/custom states remain available through explicit text/number/boolean
reporters. The registry remains an authoring aid, not a whitelist.
