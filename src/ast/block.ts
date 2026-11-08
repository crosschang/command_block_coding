/** Shared Block / block-state AST values used by block commands. */
namespace MCFunctionAST {
    export enum BlockStateValueKind {
        String = 0,
        Number = 1,
        Boolean = 2
    }

    export interface BlockStateEntry {
        key: string;
        kind: BlockStateValueKind;
        stringValue: string;
        numberValue: number;
        booleanValue: boolean;
    }

    export interface BlockStates {
        entries: BlockStateEntry[];
    }

    export function createBlockStates(): BlockStates {
        return { entries: [] };
    }

    export function createStringBlockState(
        key: string,
        value: string
    ): BlockStateEntry {
        return {
            key: key,
            kind: BlockStateValueKind.String,
            stringValue: value,
            numberValue: 0,
            booleanValue: false
        };
    }

    export function createNumberBlockState(
        key: string,
        value: number
    ): BlockStateEntry {
        return {
            key: key,
            kind: BlockStateValueKind.Number,
            stringValue: "",
            numberValue: value,
            booleanValue: false
        };
    }

    export function createBooleanBlockState(
        key: string,
        value: boolean
    ): BlockStateEntry {
        return {
            key: key,
            kind: BlockStateValueKind.Boolean,
            stringValue: "",
            numberValue: 0,
            booleanValue: value
        };
    }

    export function addBlockState(
        states: BlockStates,
        entry: BlockStateEntry
    ): void {
        states.entries.push(entry);
    }
}
