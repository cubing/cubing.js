export enum CommonMetric {
  // OBTM (Outer Block Turn Metric)
  OuterBlockTurnMetric = "OBTM",
  // RBTM (Range Block Turn Metric)
  RangeBlockTurnMetric = "RBTM",
  // SSTM (Single Slice Turn Metric)
  SingleSliceTurnMetric = "SSTM",
  // OBQTM (Outer Block Quantum Turn Metric)
  OuterBlockQuantumTurnMetric = "OBQTM",
  // RBQTM (Range Block Quantum Turn Metric)
  RangeBlockQuantumTurnMetric = "RBQTM",
  // SSQTM (Single Slice Quantum Turn Metric)
  SingleSliceQuantumTurnMetric = "SSQTM",
  ExecutionTurnMetric = "ETM",
}

export enum CommonMetricAlias {
  // QTM (Quantum Turn Metric)
  QuantumTurnMetric = "OBQTM",
  // HTM (Hand Turn Metric)
  HandTurnMetric = "OBTM",
  // STM (Slice Turn Metric)
  SliceTurnMetric = "RBTM",
}
