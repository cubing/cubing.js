// TODO: Move this?

import { Alg } from "../../../alg";
import type { Parsed } from "../../../alg/parse";
import {
  SimpleTwistyPropSource,
  TwistyPropDerived,
  TwistyPropSource,
} from "../../model/TwistyProp";
import { OrderedLeafTokens, leafTokens, AnimatedLeafUnit } from "./LeafTokens";

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
    return leafTokens(inputs.parsedAlg);
  }
}

interface LeafToHighlightPropInputs {
  targetChar: number;
  leafTokens: OrderedLeafTokens;
}
class LeafToHighlightProp extends TwistyPropDerived<
  LeafToHighlightPropInputs,
  Parsed<AnimatedLeafUnit> | null
> {
  derive(inputs: LeafToHighlightPropInputs): Parsed<AnimatedLeafUnit> | null {
    let lastLeaf: Parsed<AnimatedLeafUnit> | null = null;
    // TODO: binary search
    for (const leaf of inputs.leafTokens) {
      if (leaf.endCharIndex < inputs.targetChar) {
        return lastLeaf;
      }
      lastLeaf = leaf;
    }
    return lastLeaf;
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
