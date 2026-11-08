/**
 * P2c-3: typed TAG LIST reporter for EXECUTE RUN.
 * Reuses the SAME TAG AST and selector field as the normal TAG block.
 */
namespace MCFunctionExecuteRun {
    //% group="TAG" weight=108
    //% blockId=mcfunction_execute_run_group_tag_list
    //% block="run TAG target $target LIST"
    //% target.shadow="mcfunction_selector_self"
    export function tagList(target: MCFunctionFields.SelectorValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionAST.createTagCommand(
            target ? target.selector : undefined,
            MCFunctionAST.TagActionKind.List
        ));
    }
}
