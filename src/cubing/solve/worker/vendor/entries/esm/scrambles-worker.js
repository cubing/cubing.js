import { getNodeAdapterESM } from "../../worker/getNodeAdapter/esm";
import { getParentPortNode } from "../../worker/getParentPort/node";
import { insideStrategy, exposeAPI } from "../../worker/strategy/inside";

insideStrategy.getParentPort.node = getParentPortNode;
insideStrategy.getNodeAdapter.esm = getNodeAdapterESM;

exposeAPI();
