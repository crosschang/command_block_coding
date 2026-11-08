/** MakeCode value blocks for Bedrock block_state_array syntax. */
//% color="#58708A" weight=86 icon="\uf1b2" block="BLOCK STATES"
namespace MCFunctionBlockStateFields {
    export class BlockStatesValue {
        states: MCFunctionAST.BlockStates;

        constructor(states: MCFunctionAST.BlockStates) {
            this.states = states;
        }
    }

    /** One reusable block-state entry produced by the Block State Library. */
    export class BlockStateEntryValue {
        entry: MCFunctionAST.BlockStateEntry;

        constructor(entry: MCFunctionAST.BlockStateEntry) {
            this.entry = entry;
        }
    }

    /** Internal/common adapter used by Block State Library reporters. */
    export function entry(value: MCFunctionAST.BlockStateEntry): BlockStateEntryValue {
        return new BlockStateEntryValue(value);
    }

    function prepend(
        entry: MCFunctionAST.BlockStateEntry,
        next: BlockStatesValue
    ): BlockStatesValue {
        let states = MCFunctionAST.createBlockStates();
        MCFunctionAST.addBlockState(states, entry);

        for (let i = 0; i < next.states.entries.length; i++) {
            MCFunctionAST.addBlockState(states, next.states.entries[i]);
        }

        return new BlockStatesValue(states);
    }

    /** End a block-state chain. */
    //% blockId=mcfunction_block_states_none
    //% block="no more block states"
    export function none(): BlockStatesValue {
        return new BlockStatesValue(MCFunctionAST.createBlockStates());
    }


    /** Add one library/custom block-state entry to a state set. */
    //% blockId=mcfunction_block_states_add
    //% block="state $state next $next"
    //% inlineInputMode=external
    //% state.shadow="mcfunction_block_state_library_pillar_axis"
    //% next.shadow="mcfunction_block_states_none"
    export function add(
        state: BlockStateEntryValue,
        next: BlockStatesValue
    ): BlockStatesValue {
        return prepend(state.entry, next);
    }

    /** Add a string-valued block state. */
    //% blockId=mcfunction_block_state_string
    //% block="block state $key text $value next $next"
    //% inlineInputMode=external
    //% key.shadow="text"
    //% key.defl="minecraft:cardinal_direction"
    //% value.shadow="text"
    //% value.defl="north"
    //% next.shadow="mcfunction_block_states_none"
    export function text(
        key: string,
        value: string,
        next: BlockStatesValue
    ): BlockStatesValue {
        return prepend(
            MCFunctionAST.createStringBlockState(key, value),
            next
        );
    }

    /** Add a numeric block state. */
    //% blockId=mcfunction_block_state_number
    //% block="block state $key number $value next $next"
    //% inlineInputMode=external
    //% key.shadow="text"
    //% key.defl="facing_direction"
    //% value.defl=0
    //% next.shadow="mcfunction_block_states_none"
    export function number(
        key: string,
        value: number,
        next: BlockStatesValue
    ): BlockStatesValue {
        return prepend(
            MCFunctionAST.createNumberBlockState(key, value),
            next
        );
    }

    /** Add a literal true/false block state. */
    //% blockId=mcfunction_block_state_boolean
    //% block="block state $key boolean $value next $next"
    //% inlineInputMode=external
    //% key.shadow="text"
    //% key.defl="custom:is_lit"
    //% next.shadow="mcfunction_block_states_none"
    export function boolean(
        key: string,
        value: MCFunctionFields.BooleanLiteral,
        next: BlockStatesValue
    ): BlockStatesValue {
        return prepend(
            MCFunctionAST.createBooleanBlockState(
                key,
                MCFunctionFields.booleanLiteralValue(value)
            ),
            next
        );
    }
}
