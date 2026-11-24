/** Project resource AST. Minecraft commands remain MCFunctionAST nodes. */
namespace MCFunctionResource {
    export enum TextPartKind { Text = 0, Translate = 1, Selector = 2, Score = 3 }
    export interface TextPart {
        kind: TextPartKind;
        value: string;
        objective?: string;
        withValues?: string[];
    }
    /** Plain string and RawText object are distinct JSON field types. */
    export interface TextValue { plain?: string; parts?: TextPart[]; }
    export function plain(value: string): TextValue { return {plain: value}; }
    export function raw(part: TextPart): TextValue { return {parts: [part]}; }
    export function join(left: TextValue, right: TextValue): TextValue {
        let parts: TextPart[] = [];
        if (left) {
            if (left.parts) {
                for (let i = 0; i < left.parts.length; i++) parts.push(left.parts[i]);
            } else if (left.plain != undefined) {
                parts.push({kind: TextPartKind.Text, value: left.plain});
            }
        }
        if (right) {
            if (right.parts) {
                for (let i = 0; i < right.parts.length; i++) parts.push(right.parts[i]);
            } else if (right.plain != undefined) {
                parts.push({kind: TextPartKind.Text, value: right.plain});
            }
        }
        return {parts: parts};
    }

    export interface LanguageEntry { key: string; value: string; comment?: string; }
    export interface LanguageDocument { locale: string; entries: LanguageEntry[]; }
    export function language(locale: string): LanguageDocument {
        return {locale: locale, entries: []};
    }
    export interface DialogueButton {
        name: TextValue;
        commands: MCFunctionAST.CommandNode[];
    }
    export interface DialogueScene {
        sceneTag: string;
        npcName?: TextValue;
        text?: TextValue;
        onOpenCommands: MCFunctionAST.CommandNode[];
        onCloseCommands: MCFunctionAST.CommandNode[];
        buttons: DialogueButton[];
    }
    export function scene(tag: string, npcName?: TextValue,
        text?: TextValue): DialogueScene {
        return {sceneTag: tag, npcName: npcName, text: text,
            onOpenCommands: [], onCloseCommands: [], buttons: []};
    }
    export interface DialogueDocument {
        fileId: string;
        formatVersion: string;
        scenes: DialogueScene[];
    }
    export function dialogue(fileId: string, formatVersion: string): DialogueDocument {
        return {fileId: fileId, formatVersion: formatVersion, scenes: []};
    }
    export enum PackKind { Behavior = 0, Resource = 1 }
    export interface ResourceOutput { path: string; content: string; pack: PackKind; }
}
