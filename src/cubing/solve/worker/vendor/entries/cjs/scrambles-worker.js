import { getNodeAdapterCJS } from "../../worker/getNodeAdapter/cjs";
import { getParentPortNode } from "../../worker/getParentPort/node";
import { exposeAPI, insideStrategy } from "../../worker/strategy/inside";

insideStrategy.getParentPort.node = getParentPortNode;
insideStrategy.getNodeAdapter.cjs = getNodeAdapterCJS;

exposeAPI();
