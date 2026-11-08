/**
 * MakeCode Selector value wrapper
 *
 * Blockly/MakeCode UI에서 Selector를 값 블록으로 연결하기 위한 타입.
 * 실제 명령 의미는 내부 Selector AST가 보존한다.
 */

//% color="#6A5ACD" weight=90 icon="\uf05b" block="SELECTOR"
//% groups='["Selector Targets", "Selector Conditions", "Common Values", "others"]'
namespace MCFunctionFields {

    // ---------------------------------------------------------------------
    // Selector compact condition types
    //
    // Toolbox에서는 입력 형태별로 조건 블록을 압축해서 보여준다.
    // 실제 의미는 기존 Selector AST에 저장한다.
    // ---------------------------------------------------------------------

    export enum SelectorTextConditionType {
        //% block="name"
        Name = 0,

        //% block="tag"
        Tag = 1,

        //% block="family"
        Family = 2
    }

    // Backward-compatible Selector UI enum.
    // Keep literal numeric values aligned with MCFunctionAST.GameMode.
    // Do not initialize enum members from another enum: MakeCode/PXT treats
    // those as a different enum type and reports an assignment error.
    export enum SelectorGameMode {
        //% block="survival"
        Survival = 0,

        //% block="creative"
        Creative = 1,

        //% block="adventure"
        Adventure = 2,

        //% block="spectator"
        Spectator = 3
    }

    function selectorGameModeToken(
        mode: SelectorGameMode
    ): string {

        switch (mode) {

            case SelectorGameMode.Survival:
                return "survival";

            case SelectorGameMode.Creative:
                return "creative";

            case SelectorGameMode.Adventure:
                return "adventure";

            case SelectorGameMode.Spectator:
                return "spectator";

            default:
                return "survival";
        }
    }

    export enum SelectorNumberConditionType {
        //% block="X"
        X = 0,

        //% block="Y"
        Y = 1,

        //% block="Z"
        Z = 2,

        //% block="dX"
        DX = 3,

        //% block="dY"
        DY = 4,

        //% block="dZ"
        DZ = 5,

        //% block="count c"
        Count = 6
    }

    export enum SelectorRangeConditionType {
        //% block="distance"
        Distance = 0,

        //% block="level"
        Level = 1,

        //% block="x rotation"
        RotationX = 2,

        //% block="y rotation"
        RotationY = 3
    }

    // ---------------------------------------------------------------------
    // Legacy enum
    //
    // 기존 저장 프로젝트/블록 호환용으로 유지한다.
    // 새 Toolbox에서는 직접 노출하지 않는다.
    // ---------------------------------------------------------------------

    export enum SelectorNumberFilterType {
        X = 0,
        Y = 1,
        Z = 2,
        DX = 3,
        DY = 4,
        DZ = 5,
        RadiusMax = 6,
        RadiusMin = 7,
        LevelMax = 8,
        LevelMin = 9,
        RotationXMax = 10,
        RotationXMin = 11,
        RotationYMax = 12,
        RotationYMin = 13,
        Count = 14
    }

    export enum HasItemLocation {
        //% block="main hand"
        MainHand = 0,

        //% block="off hand"
        OffHand = 1,

        //% block="head"
        Head = 2,

        //% block="chest"
        Chest = 3,

        //% block="legs"
        Legs = 4,

        //% block="feet"
        Feet = 5,

        //% block="hotbar"
        Hotbar = 6,

        //% block="inventory"
        Inventory = 7,

        //% block="ender chest"
        EnderChest = 8
    }

    function toSlotLocation(
        location: HasItemLocation
    ): MCFunctionAST.SlotLocation {

        switch (location) {

            case HasItemLocation.MainHand:
                return MCFunctionAST.SlotLocation.WeaponMainhand;

            case HasItemLocation.OffHand:
                return MCFunctionAST.SlotLocation.WeaponOffhand;

            case HasItemLocation.Head:
                return MCFunctionAST.SlotLocation.ArmorHead;

            case HasItemLocation.Chest:
                return MCFunctionAST.SlotLocation.ArmorChest;

            case HasItemLocation.Legs:
                return MCFunctionAST.SlotLocation.ArmorLegs;

            case HasItemLocation.Feet:
                return MCFunctionAST.SlotLocation.ArmorFeet;

            case HasItemLocation.Hotbar:
                return MCFunctionAST.SlotLocation.Hotbar;

            case HasItemLocation.Inventory:
                return MCFunctionAST.SlotLocation.Inventory;

            case HasItemLocation.EnderChest:
                return MCFunctionAST.SlotLocation.EnderChest;

            default:
                return MCFunctionAST.SlotLocation.Inventory;
        }
    }

    // ---------------------------------------------------------------------
    // Selector Condition Chain
    //
    // MakeCode UI에서는 조건들을 다음(next)으로 이어 붙이고,
    // Block Adapter가 최종 Selector AST에 적용한다.
    // ---------------------------------------------------------------------

    export class SelectorConditionValue {

        filters: MCFunctionAST.SelectorFilter[];
        scores: MCFunctionAST.SelectorScoreCondition[];
        hasItems: MCFunctionAST.SelectorHasItemCondition[];

        next: SelectorConditionValue;
        isEnd: boolean;

        constructor() {
            this.filters = [];
            this.scores = [];
            this.hasItems = [];

            // PXT 호환을 위해 null/undefined 대신 자기 자신을 기본값으로 둔다.
            // 실제 조건 생성 함수에서는 반드시 next를 덮어쓴다.
            this.next = this;
            this.isEnd = false;
        }
    }

    //% group="Selector Conditions"
    //% blockId=mcfunction_selector_no_condition
    //% block="no more conditions"
    export function noSelectorCondition(
    ): SelectorConditionValue {

        let condition =
            new SelectorConditionValue();

        condition.isEnd = true;

        return condition;
    }

    function applySelectorConditions(
        selector: MCFunctionAST.Selector,
        condition: SelectorConditionValue
    ): void {

        let current = condition;

        while (!current.isEnd) {

            // 일반 Selector Filter
            for (
                let i = 0;
                i < current.filters.length;
                i++
            ) {

                let filter = current.filters[i];

                // 반복 가능한 조건
                if (
                    filter.key == "tag" ||
                    filter.key == "family" ||
                    filter.key == "type" ||
                    filter.key == "name"
                ) {

                    MCFunctionAST.addSelectorFilter(
                        selector,
                        filter
                    );

                } else {

                    // x, r, m, l, rx 등 단일 조건
                    MCFunctionAST.setSelectorFilter(
                        selector,
                        filter
                    );
                }
            }

            // Scores: objective별로 하나만 유지
            for (
                let i = 0;
                i < current.scores.length;
                i++
            ) {

                MCFunctionAST.setSelectorScoreCondition(
                    selector,
                    current.scores[i]
                );
            }

            // HasItem: keep every condition in chain order (AND semantics).
            // The AST already contains hasItems[]; do not overwrite the previous item.
            for (
                let i = 0;
                i < current.hasItems.length;
                i++
            ) {

                MCFunctionAST.addSelectorHasItemCondition(
                    selector,
                    current.hasItems[i]
                );
            }

            current = current.next;
        }
    }

    // ---------------------------------------------------------------------
    // Selector 조건 블록
    // ---------------------------------------------------------------------

    //% group="Selector Conditions"
    //% blockId=mcfunction_selector_entity_type_condition
    //% block="type $entity|exclude $exclude|next $next"
    //% inlineInputMode=external
    //% entity.shadow="mcfunction_entity_select"
    //% next.shadow="mcfunction_selector_no_condition"
    export function addEntityTypeCondition(
        entity: EntityValue,
        exclude: BooleanLiteral,
        next: SelectorConditionValue
    ): SelectorConditionValue {

        let condition =
            new SelectorConditionValue();

        condition.next = next;

        condition.filters.push(
            MCFunctionAST.createSelectorFilter(
                "type",
                entity.entityId,
                booleanLiteralValue(exclude)
            )
        );

        return condition;
    }

    //% group="Selector Conditions"
    //% blockId=mcfunction_selector_text_condition
    //% block="$conditionType value $value|exclude $exclude|next $next"
    //% inlineInputMode=external
    //% value.defl="Boss"
    //% next.shadow="mcfunction_selector_no_condition"
    export function addTextCondition(
        conditionType: SelectorTextConditionType,
        value: string,
        exclude: BooleanLiteral,
        next: SelectorConditionValue
    ): SelectorConditionValue {

        let key = "";

        switch (conditionType) {

            case SelectorTextConditionType.Name:
                key = "name";
                break;

            case SelectorTextConditionType.Tag:
                key = "tag";
                break;

            case SelectorTextConditionType.Family:
                key = "family";
                break;
        }

        let condition =
            new SelectorConditionValue();

        condition.next = next;

        condition.filters.push(
            MCFunctionAST.createSelectorFilter(
                key,
                value,
                booleanLiteralValue(exclude)
            )
        );

        return condition;
    }

    //% group="Selector Conditions"
    //% blockId=mcfunction_selector_gamemode_condition
    //% block="gamemode $mode|exclude $exclude|next $next"
    //% inlineInputMode=external
    //% next.shadow="mcfunction_selector_no_condition"
    export function addGameModeCondition(
        mode: SelectorGameMode,
        exclude: BooleanLiteral,
        next: SelectorConditionValue
    ): SelectorConditionValue {

        let condition =
            new SelectorConditionValue();

        condition.next = next;

        condition.filters.push(
            MCFunctionAST.createSelectorFilter(
                "m",
                selectorGameModeToken(mode),
                booleanLiteralValue(exclude)
            )
        );

        return condition;
    }

    //% group="Selector Conditions"
    //% blockId=mcfunction_selector_number_condition
    //% block="$conditionType value $value|next $next"
    //% inlineInputMode=external
    //% value.defl=0
    //% next.shadow="mcfunction_selector_no_condition"
    export function addNumberCondition(
        conditionType: SelectorNumberConditionType,
        value: number,
        next: SelectorConditionValue
    ): SelectorConditionValue {

        let key = "";

        switch (conditionType) {

            case SelectorNumberConditionType.X:
                key = "x";
                break;

            case SelectorNumberConditionType.Y:
                key = "y";
                break;

            case SelectorNumberConditionType.Z:
                key = "z";
                break;

            case SelectorNumberConditionType.DX:
                key = "dx";
                break;

            case SelectorNumberConditionType.DY:
                key = "dy";
                break;

            case SelectorNumberConditionType.DZ:
                key = "dz";
                break;

            case SelectorNumberConditionType.Count:
                key = "c";
                break;
        }

        let condition =
            new SelectorConditionValue();

        condition.next = next;

        condition.filters.push(
            MCFunctionAST.createSelectorFilter(
                key,
                "" + value,
                false
            )
        );

        return condition;
    }

    //% group="Selector Conditions"
    //% blockId=mcfunction_selector_range_condition
    //% block="$conditionType $range|next $next"
    //% inlineInputMode=external
    //% range.shadow="mcfunction_range_min_max"
    //% next.shadow="mcfunction_selector_no_condition"
    export function addRangeCondition(
        conditionType: SelectorRangeConditionType,
        range: RangeValue,
        next: SelectorConditionValue
    ): SelectorConditionValue {

        let minKey = "";
        let maxKey = "";

        switch (conditionType) {

            case SelectorRangeConditionType.Distance:
                minKey = "rm";
                maxKey = "r";
                break;

            case SelectorRangeConditionType.Level:
                minKey = "lm";
                maxKey = "l";
                break;

            case SelectorRangeConditionType.RotationX:
                minKey = "rxm";
                maxKey = "rx";
                break;

            case SelectorRangeConditionType.RotationY:
                minKey = "rym";
                maxKey = "ry";
                break;
        }

        let condition =
            new SelectorConditionValue();

        condition.next = next;

        if (range.range.hasMin) {
            condition.filters.push(
                MCFunctionAST.createSelectorFilter(
                    minKey,
                    "" + range.range.min,
                    false
                )
            );
        }

        if (range.range.hasMax) {
            condition.filters.push(
                MCFunctionAST.createSelectorFilter(
                    maxKey,
                    "" + range.range.max,
                    false
                )
            );
        }

        return condition;
    }

    //% group="Selector Conditions"
    //% blockHidden=true
    //% blockId=mcfunction_selector_type_filter
    //% block="type $typeId|exclude $exclude|next $next"
    //% inlineInputMode=external
    //% typeId.defl="minecraft:zombie"
    //% exclude.defl=false
    //% next.shadow="mcfunction_selector_no_condition"
    export function addTypeFilter(
        typeId: string,
        exclude: boolean,
        next: SelectorConditionValue
    ): SelectorConditionValue {

        let condition =
            new SelectorConditionValue();

        condition.next = next;

        condition.filters.push(
            MCFunctionAST.createSelectorFilter(
                "type",
                typeId,
                exclude
            )
        );

        return condition;
    }

    //% group="Selector Conditions"
    //% blockHidden=true
    //% blockId=mcfunction_selector_name_filter
    //% block="name $name|exclude $exclude|next $next"
    //% inlineInputMode=external
    //% name.defl="Boss"
    //% exclude.defl=false
    //% next.shadow="mcfunction_selector_no_condition"
    export function addNameFilter(
        name: string,
        exclude: boolean,
        next: SelectorConditionValue
    ): SelectorConditionValue {

        let condition =
            new SelectorConditionValue();

        condition.next = next;

        condition.filters.push(
            MCFunctionAST.createSelectorFilter(
                "name",
                name,
                exclude
            )
        );

        return condition;
    }

    //% group="Selector Conditions"
    //% blockHidden=true
    //% blockId=mcfunction_selector_tag_filter
    //% block="tag $tag|exclude $exclude|next $next"
    //% inlineInputMode=external
    //% tag.defl="boss"
    //% exclude.defl=false
    //% next.shadow="mcfunction_selector_no_condition"
    export function addTagFilter(
        tag: string,
        exclude: boolean,
        next: SelectorConditionValue
    ): SelectorConditionValue {

        let condition =
            new SelectorConditionValue();

        condition.next = next;

        condition.filters.push(
            MCFunctionAST.createSelectorFilter(
                "tag",
                tag,
                exclude
            )
        );

        return condition;
    }

    //% group="Selector Conditions"
    //% blockHidden=true
    //% blockId=mcfunction_selector_family_filter
    //% block="family $family|exclude $exclude|next $next"
    //% inlineInputMode=external
    //% family.defl="monster"
    //% exclude.defl=false
    //% next.shadow="mcfunction_selector_no_condition"
    export function addFamilyFilter(
        family: string,
        exclude: boolean,
        next: SelectorConditionValue
    ): SelectorConditionValue {

        let condition =
            new SelectorConditionValue();

        condition.next = next;

        condition.filters.push(
            MCFunctionAST.createSelectorFilter(
                "family",
                family,
                exclude
            )
        );

        return condition;
    }

    //% group="Selector Conditions"
    //% blockHidden=true
    //% blockId=mcfunction_selector_gamemode_filter
    //% block="gamemode $gamemode|exclude $exclude|next $next"
    //% inlineInputMode=external
    //% gamemode.defl="survival"
    //% exclude.defl=false
    //% next.shadow="mcfunction_selector_no_condition"
    export function addGameModeFilter(
        gamemode: string,
        exclude: boolean,
        next: SelectorConditionValue
    ): SelectorConditionValue {

        let condition =
            new SelectorConditionValue();

        condition.next = next;

        condition.filters.push(
            MCFunctionAST.createSelectorFilter(
                "m",
                gamemode,
                exclude
            )
        );

        return condition;
    }

    //% group="Selector Conditions"
    //% blockHidden=true
    //% blockId=mcfunction_selector_number_filter
    //% block="$filterType value $value|next $next"
    //% inlineInputMode=external
    //% value.defl=0
    //% next.shadow="mcfunction_selector_no_condition"
    export function addNumberFilter(
        filterType: SelectorNumberFilterType,
        value: number,
        next: SelectorConditionValue
    ): SelectorConditionValue {

        let key = "";

        switch (filterType) {
            case SelectorNumberFilterType.X:
                key = "x";
                break;

            case SelectorNumberFilterType.Y:
                key = "y";
                break;

            case SelectorNumberFilterType.Z:
                key = "z";
                break;

            case SelectorNumberFilterType.DX:
                key = "dx";
                break;

            case SelectorNumberFilterType.DY:
                key = "dy";
                break;

            case SelectorNumberFilterType.DZ:
                key = "dz";
                break;

            case SelectorNumberFilterType.RadiusMax:
                key = "r";
                break;

            case SelectorNumberFilterType.RadiusMin:
                key = "rm";
                break;

            case SelectorNumberFilterType.LevelMax:
                key = "l";
                break;

            case SelectorNumberFilterType.LevelMin:
                key = "lm";
                break;

            case SelectorNumberFilterType.RotationXMax:
                key = "rx";
                break;

            case SelectorNumberFilterType.RotationXMin:
                key = "rxm";
                break;

            case SelectorNumberFilterType.RotationYMax:
                key = "ry";
                break;

            case SelectorNumberFilterType.RotationYMin:
                key = "rym";
                break;

            case SelectorNumberFilterType.Count:
                key = "c";
                break;
        }

        let condition =
            new SelectorConditionValue();

        condition.next = next;

        condition.filters.push(
            MCFunctionAST.createSelectorFilter(
                key,
                "" + value,
                false
            )
        );

        return condition;
    }

    //% group="Selector Conditions"
    //% blockHidden=true
    //% blockId=mcfunction_selector_position_filter
    //% block="position|x $x|y $y|z $z|next $next"
    //% inlineInputMode=external
    //% x.defl=0
    //% y.defl=0
    //% z.defl=0
    //% next.shadow="mcfunction_selector_no_condition"
    export function addPositionFilter(
        x: number,
        y: number,
        z: number,
        next: SelectorConditionValue
    ): SelectorConditionValue {

        let condition =
            new SelectorConditionValue();

        condition.next = next;

        condition.filters.push(
            MCFunctionAST.createSelectorFilter(
                "x",
                "" + x,
                false
            )
        );

        condition.filters.push(
            MCFunctionAST.createSelectorFilter(
                "y",
                "" + y,
                false
            )
        );

        condition.filters.push(
            MCFunctionAST.createSelectorFilter(
                "z",
                "" + z,
                false
            )
        );

        return condition;
    }

    //% group="Selector Conditions"
    //% blockHidden=true
    //% blockId=mcfunction_selector_area_filter
    //% block="area|x $x|y $y|z $z|dx $dx|dy $dy|dz $dz|next $next"
    //% inlineInputMode=external
    //% x.defl=0
    //% y.defl=0
    //% z.defl=0
    //% dx.defl=0
    //% dy.defl=0
    //% dz.defl=0
    //% next.shadow="mcfunction_selector_no_condition"
    export function addAreaFilter(
        x: number,
        y: number,
        z: number,
        dx: number,
        dy: number,
        dz: number,
        next: SelectorConditionValue
    ): SelectorConditionValue {

        let condition =
            new SelectorConditionValue();

        condition.next = next;

        let keys = ["x", "y", "z", "dx", "dy", "dz"];
        let values = [x, y, z, dx, dy, dz];

        for (let i = 0; i < keys.length; i++) {
            condition.filters.push(
                MCFunctionAST.createSelectorFilter(
                    keys[i],
                    "" + values[i],
                    false
                )
            );
        }

        return condition;
    }

    //% group="Selector Conditions"
    //% blockHidden=true
    //% blockId=mcfunction_selector_distance_filter
    //% block="distance $range next $next"
    //% range.shadow="mcfunction_range_min_max"
    //% next.shadow="mcfunction_selector_no_condition"
    export function addDistanceFilter(
        range: RangeValue,
        next: SelectorConditionValue
    ): SelectorConditionValue {

        let condition =
            new SelectorConditionValue();

        condition.next = next;

        if (range.range.hasMin) {
            condition.filters.push(
                MCFunctionAST.createSelectorFilter(
                    "rm",
                    "" + range.range.min,
                    false
                )
            );
        }

        if (range.range.hasMax) {
            condition.filters.push(
                MCFunctionAST.createSelectorFilter(
                    "r",
                    "" + range.range.max,
                    false
                )
            );
        }

        return condition;
    }

    //% group="Selector Conditions"
    //% blockHidden=true
    //% blockId=mcfunction_selector_level_filter
    //% block="level $range next $next"
    //% range.shadow="mcfunction_range_min_max"
    //% next.shadow="mcfunction_selector_no_condition"
    export function addLevelFilter(
        range: RangeValue,
        next: SelectorConditionValue
    ): SelectorConditionValue {

        let condition =
            new SelectorConditionValue();

        condition.next = next;

        if (range.range.hasMin) {
            condition.filters.push(
                MCFunctionAST.createSelectorFilter(
                    "lm",
                    "" + range.range.min,
                    false
                )
            );
        }

        if (range.range.hasMax) {
            condition.filters.push(
                MCFunctionAST.createSelectorFilter(
                    "l",
                    "" + range.range.max,
                    false
                )
            );
        }

        return condition;
    }

    //% group="Selector Conditions"
    //% blockHidden=true
    //% blockId=mcfunction_selector_rotation_x_filter
    //% block="x rotation $range next $next"
    //% range.shadow="mcfunction_range_min_max"
    //% next.shadow="mcfunction_selector_no_condition"
    export function addRotationXFilter(
        range: RangeValue,
        next: SelectorConditionValue
    ): SelectorConditionValue {

        let condition =
            new SelectorConditionValue();

        condition.next = next;

        if (range.range.hasMin) {
            condition.filters.push(
                MCFunctionAST.createSelectorFilter(
                    "rxm",
                    "" + range.range.min,
                    false
                )
            );
        }

        if (range.range.hasMax) {
            condition.filters.push(
                MCFunctionAST.createSelectorFilter(
                    "rx",
                    "" + range.range.max,
                    false
                )
            );
        }

        return condition;
    }

    //% group="Selector Conditions"
    //% blockHidden=true
    //% blockId=mcfunction_selector_rotation_y_filter
    //% block="y rotation $range next $next"
    //% range.shadow="mcfunction_range_min_max"
    //% next.shadow="mcfunction_selector_no_condition"
    export function addRotationYFilter(
        range: RangeValue,
        next: SelectorConditionValue
    ): SelectorConditionValue {

        let condition =
            new SelectorConditionValue();

        condition.next = next;

        if (range.range.hasMin) {
            condition.filters.push(
                MCFunctionAST.createSelectorFilter(
                    "rym",
                    "" + range.range.min,
                    false
                )
            );
        }

        if (range.range.hasMax) {
            condition.filters.push(
                MCFunctionAST.createSelectorFilter(
                    "ry",
                    "" + range.range.max,
                    false
                )
            );
        }

        return condition;
    }

    //% group="Selector Conditions"
    //% blockId=mcfunction_selector_score_filter
    //% block="score objective $objective|range $range|next $next"
    //% inlineInputMode=external
    //% objective.defl="money"
    //% range.shadow="mcfunction_range_min_max"
    //% next.shadow="mcfunction_selector_no_condition"
    export function addScoreFilter(
        objective: string,
        range: RangeValue,
        next: SelectorConditionValue
    ): SelectorConditionValue {

        let condition =
            new SelectorConditionValue();

        condition.next = next;

        condition.scores.push(
            MCFunctionAST.createSelectorScoreCondition(
                objective,
                range.range,
                false
            )
        );

        return condition;
    }

    //% group="Selector Conditions"
    //% blockId=mcfunction_selector_hasitem_filter
    //% block="has item $item|quantity $quantity|next $next"
    //% inlineInputMode=external
    //% item.shadow="mcfunction_item_id_text_shadow"
    //% quantity.shadow="mcfunction_range_min"
    //% next.shadow="mcfunction_selector_no_condition"
    export function addHasItemFilter(
        item: string,
        quantity: RangeValue,
        next: SelectorConditionValue
    ): SelectorConditionValue {

        let condition =
            new SelectorConditionValue();

        condition.next = next;

        let itemValue = MCFunctionFields.item(item);

        condition.hasItems.push(
            MCFunctionAST.createSelectorHasItemCondition(
                itemValue.itemId,
                quantity.range
            )
        );

        return condition;
    }

    //% group="Selector Conditions"
    //% blockId=mcfunction_selector_hasitem_advanced
    //% block="has item details $item|quantity $quantity|location $location|slot $slot|data $data|next $next"
    //% inlineInputMode=external
    //% item.shadow="mcfunction_item_id_text_shadow"
    //% quantity.shadow="mcfunction_range_min"
    //% slot.defl=0
    //% data.defl=0
    //% next.shadow="mcfunction_selector_no_condition"
    export function addHasItemAdvancedFilter(
        item: string,
        quantity: RangeValue,
        location: HasItemLocation,
        slot: number,
        data: number,
        next: SelectorConditionValue
    ): SelectorConditionValue {

        let slotRange =
            MCFunctionAST.createMinMaxRange(
                slot,
                slot
            );

        let itemValue =
            MCFunctionFields.item(item);

        let hasItem =
            MCFunctionAST.createSelectorHasItemAdvancedCondition(
                itemValue.itemId,
                quantity.range,

                true,
                toSlotLocation(location),

                true,
                slotRange,

                true,
                data
            );

        let condition =
            new SelectorConditionValue();

        condition.next = next;
        condition.hasItems.push(hasItem);

        return condition;
    }

    // ---------------------------------------------------------------------
    // Selector Value
    // ---------------------------------------------------------------------

    export class SelectorValue {
        selector: MCFunctionAST.Selector;

        constructor(selector: MCFunctionAST.Selector) {
            this.selector = selector;
        }
    }

    /** Command target reference: a Selector AST or a literal player name. */
    export class TargetValue {
        target: MCFunctionAST.PlayerTarget;

        constructor(target: MCFunctionAST.PlayerTarget) {
            this.target = target;
        }
    }

    /** Reuse all existing selector conditions inside a target argument. */
    //% group="Selector Targets" weight=102
    //% blockId=mcfunction_target_selector
    //% block="target selector $selector"
    //% selector.shadow="mcfunction_selector_self"
    //% inlineInputMode=external
    export function targetSelector(selector: SelectorValue): TargetValue {
        return new TargetValue(MCFunctionAST.createSelectorPlayerTarget(
            selector ? selector.selector : undefined));
    }

    /** Shared literal-name reporter for SPAWNPOINT, TP and future target commands. */
    //% group="Selector Targets" weight=101
    //% blockId=mcfunction_target_named_player
    //% block="named player $playerName"
    //% playerName.shadow="text" playerName.defl="Steve"
    export function namedPlayerTarget(playerName: string): TargetValue {
        return new TargetValue(MCFunctionAST.createNamedPlayerTarget(playerName));
    }

    // ---------------------------------------------------------------------
    // Selector 대상
    //
    // @a, @e, @p, @r, @s → 조건 체인 사용 가능
    // @initiator            → Dialogue 전용, 조건 사용 불가
    // ---------------------------------------------------------------------

    //% group="Selector Targets"
    //% blockId=mcfunction_selector_all_players
    //% block="all players @a $conditions"
    //% conditions.shadow="mcfunction_selector_no_condition"
    export function allPlayers(
        conditions: SelectorConditionValue
    ): SelectorValue {

        let selector =
            MCFunctionAST.createSelector(
                MCFunctionAST.SelectorBase.AllPlayers
            );

        applySelectorConditions(
            selector,
            conditions
        );

        return new SelectorValue(
            selector
        );
    }

    //% group="Selector Targets"
    //% blockId=mcfunction_selector_all_entities
    //% block="all entities @e $conditions"
    //% conditions.shadow="mcfunction_selector_no_condition"
    export function allEntities(
        conditions: SelectorConditionValue
    ): SelectorValue {

        let selector =
            MCFunctionAST.createSelector(
                MCFunctionAST.SelectorBase.AllEntities
            );

        applySelectorConditions(
            selector,
            conditions
        );

        return new SelectorValue(
            selector
        );
    }

    //% group="Selector Targets"
    //% blockId=mcfunction_selector_nearest_player
    //% block="nearest player @p $conditions"
    //% conditions.shadow="mcfunction_selector_no_condition"
    export function nearestPlayer(
        conditions: SelectorConditionValue
    ): SelectorValue {

        let selector =
            MCFunctionAST.createSelector(
                MCFunctionAST.SelectorBase.NearestPlayer
            );

        applySelectorConditions(
            selector,
            conditions
        );

        return new SelectorValue(
            selector
        );
    }

    //% group="Selector Targets"
    //% blockId=mcfunction_selector_random_player
    //% block="random player @r $conditions"
    //% conditions.shadow="mcfunction_selector_no_condition"
    export function randomPlayer(
        conditions: SelectorConditionValue
    ): SelectorValue {

        let selector =
            MCFunctionAST.createSelector(
                MCFunctionAST.SelectorBase.RandomPlayer
            );

        applySelectorConditions(
            selector,
            conditions
        );

        return new SelectorValue(
            selector
        );
    }

    //% group="Selector Targets"
    //% blockId=mcfunction_selector_self
    //% block="self @s $conditions"
    //% conditions.shadow="mcfunction_selector_no_condition"
    export function self(
        conditions: SelectorConditionValue
    ): SelectorValue {

        let selector =
            MCFunctionAST.createSelector(
                MCFunctionAST.SelectorBase.Self
            );

        applySelectorConditions(
            selector,
            conditions
        );

        return new SelectorValue(
            selector
        );
    }

    //% group="Selector Targets"
    //% blockId=mcfunction_selector_initiator
    //% block="dialogue initiator @initiator"
    export function initiator(): SelectorValue {

        return new SelectorValue(
            MCFunctionAST.createSelector(
                MCFunctionAST.SelectorBase.Initiator
            )
        );
    }
}
