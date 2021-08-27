// TODO: Move this?

import { Alg } from "../../../alg";
import type { Parsed } from "../../../alg/parse";
import {
  SimpleTwistyPropSource,
  TwistyPropDerived,
  TwistyPropSource,
} from "../../model/TwistyProp";
import {
  AnimatedLeafUnitInfo,
  leafTokens,
  OrderedLeafTokens,
} from "./LeafTokens";

export class TwistyAlgEditorValueProp extends SimpleTwistyPropSource<string> {
  getDefaultValue(): string {
    return "";
  }
}

interface SelectionInfoPropInput {
  selectionStart: number;
  selectionEnd: number;
}
interface SelectionInfo extends SelectionInfoPropInput {
  endChangedMostRecently: boolean;
}
export class TwistyAlgEditorSelectionProp extends TwistyPropSource<
  SelectionInfo,
  SelectionInfoPropInput
> {
  getDefaultValue() {
    return {
      selectionStart: 0,
      selectionEnd: 0,
      endChangedMostRecently: false,
    };
  }

  async derive(
    input: SelectionInfoPropInput,
    oldValue: Promise<SelectionInfo>,
  ): Promise<SelectionInfo> {
    let { selectionStart, selectionEnd } = input;
    const lastResult = await oldValue;
    const endChangedMostRecently =
      input.selectionStart === lastResult.selectionStart &&
      input.selectionEnd !== (await oldValue).selectionEnd;
    return {
      selectionStart,
      selectionEnd,
      endChangedMostRecently,
    };
  }
}

interface TargetCharPropInputs {
  selectionInfo: SelectionInfo;
}

export class TargetCharProp extends TwistyPropDerived<
  TargetCharPropInputs,
  number
> {
  derive(inputs: TargetCharPropInputs) {
    return inputs.selectionInfo.endChangedMostRecently
      ? inputs.selectionInfo.selectionEnd
      : inputs.selectionInfo.selectionStart;
  }
}

class AlgInputProp extends SimpleTwistyPropSource<Alg> {
  getDefaultValue(): Alg {
    return new Alg();
  }
}

interface ParsedAlgPropInputs {
  alg: Alg | Parsed<Alg>;
}
class ParsedAlgProp extends TwistyPropDerived<
  ParsedAlgPropInputs,
  Parsed<Alg>
> {
  derive(inputs: ParsedAlgPropInputs): Parsed<Alg> {
    if ("" in inputs.alg) {
      return inputs.alg;
    }

    return Alg.fromString(inputs.alg.toString()) as Parsed<Alg>;
  }
}

interface LeafTokensPropInputs {
  parsedAlg: Parsed<Alg>;
}
class LeafTokensProp extends TwistyPropDerived<
  LeafTokensPropInputs,
  OrderedLeafTokens
> {
  derive(inputs: LeafTokensPropInputs): OrderedLeafTokens {
    return leafTokens(inputs.parsedAlg, { numMovesSofar: 0 }).tokens;
  }
}

interface LeafToHighlightPropInputs {
  targetChar: number;
  leafTokens: OrderedLeafTokens;
}
type HighlightWhere = "before" | "start" | "inside" | "end" | "after";
export interface HighlightInfo {
  leafInfo: AnimatedLeafUnitInfo;
  where: HighlightWhere;
}
class LeafToHighlightProp extends TwistyPropDerived<
  LeafToHighlightPropInputs,
  HighlightInfo | null
> {
  derive(inputs: LeafToHighlightPropInputs): HighlightInfo | null {
    function withWhere(
      leafInfo: AnimatedLeafUnitInfo | null,
    ): HighlightInfo | null {
      if (leafInfo === null) {
        return null;
      }
      let where: HighlightWhere;
      if (inputs.targetChar < leafInfo.leaf.startCharIndex) {
        where = "before";
      } else if (inputs.targetChar === leafInfo.leaf.startCharIndex) {
        where = "start";
      } else if (inputs.targetChar < leafInfo.leaf.endCharIndex) {
        where = "inside";
      } else if (inputs.targetChar === leafInfo.leaf.endCharIndex) {
        where = "end";
      } else {
        where = "after";
      }
      return {
        leafInfo,
        where,
      };
    }

    let lastLeafInfo: AnimatedLeafUnitInfo | null = null;
    // TODO: binary search
    for (const leafInfo of inputs.leafTokens) {
      if (inputs.targetChar < leafInfo.leaf.startCharIndex) {
        return withWhere(lastLeafInfo);
      }
      if (inputs.targetChar <= leafInfo.leaf.endCharIndex) {
        return withWhere(leafInfo);
      }
      lastLeafInfo = leafInfo;
    }

    return withWhere(lastLeafInfo);
  }
}

export class TwistyAlgEditorModel {
  valueProp = new TwistyAlgEditorValueProp();
  selectionProp = new TwistyAlgEditorSelectionProp();
  targetCharProp = new TargetCharProp({ selectionInfo: this.selectionProp });

  algInputProp = new AlgInputProp();
  parsedAlgProp = new ParsedAlgProp({ alg: this.algInputProp });
  leafTokensProp = new LeafTokensProp({ parsedAlg: this.parsedAlgProp });

  leafToHighlight = new LeafToHighlightProp({
    leafTokens: this.leafTokensProp,
    targetChar: this.targetCharProp,
  });
}
