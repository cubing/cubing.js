// TODO: Move this?

import type { Alg } from "../../../alg";
import {
  endCharIndexKey,
  type Parsed,
  startCharIndexKey,
} from "../../../alg/parseAlg";
import {
  type AlgWithIssues,
  algWithIssuesFromString,
} from "../../model/props/puzzle/state/AlgProp";
import {
  SimpleTwistyPropSource,
  TwistyPropDerived,
  TwistyPropSource,
} from "../../model/props/TwistyProp";
import {
  type AnimatedLeafAlgNodeInfo,
  leafTokens,
  type OrderedLeafTokens,
} from "./LeafTokens";

export class TwistyAlgEditorValueProp extends SimpleTwistyPropSource<string> {
  getDefaultValue(): string {
    return "";
  }
}

interface AlgEditorAlgWithIssuesPropInput {
  value: string;
}
class AlgEditorAlgWithIssuesProp extends TwistyPropDerived<
  AlgEditorAlgWithIssuesPropInput,
  AlgWithIssues
> {
  derive(input: AlgEditorAlgWithIssuesPropInput): AlgWithIssues {
    return algWithIssuesFromString(input.value);
  }
  // TODO: canReuse needs to take the source string into account.
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
    const { selectionStart, selectionEnd } = input;
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

interface LeafTokensPropInputs {
  algWithIssues: AlgWithIssues;
}
class LeafTokensProp extends TwistyPropDerived<
  LeafTokensPropInputs,
  OrderedLeafTokens
> {
  derive(inputs: LeafTokensPropInputs): OrderedLeafTokens {
    return leafTokens(inputs.algWithIssues.alg as Parsed<Alg>, {
      numMovesSofar: 0,
    }).tokens;
  }
}

interface LeafToHighlightPropInputs {
  targetChar: number;
  leafTokens: OrderedLeafTokens;
}
type HighlightWhere = "before" | "start" | "inside" | "end" | "after";
export interface HighlightInfo {
  leafInfo: AnimatedLeafAlgNodeInfo;
  where: HighlightWhere;
}
class LeafToHighlightProp extends TwistyPropDerived<
  LeafToHighlightPropInputs,
  HighlightInfo | null
> {
  derive(inputs: LeafToHighlightPropInputs): HighlightInfo | null {
    function withWhere(
      leafInfo: AnimatedLeafAlgNodeInfo | null,
    ): HighlightInfo | null {
      if (leafInfo === null) {
        return null;
      }
      let where: HighlightWhere;
      if (inputs.targetChar < leafInfo.leaf[startCharIndexKey]) {
        where = "before";
      } else if (inputs.targetChar === leafInfo.leaf[startCharIndexKey]) {
        where = "start";
      } else if (inputs.targetChar < leafInfo.leaf[endCharIndexKey]) {
        where = "inside";
      } else if (inputs.targetChar === leafInfo.leaf[endCharIndexKey]) {
        where = "end";
      } else {
        where = "after";
      }
      return {
        leafInfo,
        where,
      };
    }

    let lastLeafInfo: AnimatedLeafAlgNodeInfo | null = null;
    // TODO: binary search
    for (const leafInfo of inputs.leafTokens) {
      if (
        inputs.targetChar < leafInfo.leaf[startCharIndexKey] &&
        lastLeafInfo !== null
      ) {
        return withWhere(lastLeafInfo);
      }
      if (inputs.targetChar <= leafInfo.leaf[endCharIndexKey]) {
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

  algEditorAlgWithIssues = new AlgEditorAlgWithIssuesProp({
    value: this.valueProp,
  });

  leafTokensProp = new LeafTokensProp({
    algWithIssues: this.algEditorAlgWithIssues,
  });

  leafToHighlight = new LeafToHighlightProp({
    leafTokens: this.leafTokensProp,
    targetChar: this.targetCharProp,
  });
}
