// TODO: Move this?

import {
  SimpleTwistyPropSource,
  TwistyPropDerived,
  TwistyPropSource,
} from "../../model/TwistyProp";

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

export class TwistyAlgEditorModel {
  valueProp = new TwistyAlgEditorValueProp();
  selectionProp = new TwistyAlgEditorSelectionProp();
  targetCharProp = new TargetCharProp({ selectionInfo: this.selectionProp });
}
