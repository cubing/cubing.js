import { TwizzleLink } from "../../../../cubing/twisty";

const contentElem = document.querySelector(".content")!;

const link1 = new TwizzleLink({ cdnForumTweaks: true });
link1.appendChild(document.createElement("a")).href =
  "https://alpha.twizzle.net/edit/?alg=y%27+L%27+D%27+U%27+R+%2F%2F+Double+X-Cross+%0Ay+U%27+L%27+U+L+%2F%2F+Slot+3+%0AR+U+R%27+%2F%2F+ELS+%0AU2+%5BR%27+D%27+R%3A+U%5D+%2F%2F+CLS+%0AU%27+M2%27+U%27+M2%27+U2%27+M2%27+U%27+M2%27+%2F%2F+PLL&setup-alg=L+F+L2+U%27+L+U2+D%27+L+U2+D2+R%27+F2+D2+B2+L2+D2+F2+R+B&title=Forum+Tweak+Example%0ALucas+Garron%2C+4.88s+PB%0AOctober+20%2C+2020";
contentElem.appendChild(link1);

const link2 = new TwizzleLink({ cdnForumTweaks: true, colorScheme: "dark" });
link2.appendChild(document.createElement("a")).href =
  "https://alpha.twizzle.net/edit/?alg=y%27+L%27+D%27+U%27+R+%2F%2F+Double+X-Cross+%0Ay+U%27+L%27+U+L+%2F%2F+Slot+3+%0AR+U+R%27+%2F%2F+ELS+%0AU2+%5BR%27+D%27+R%3A+U%5D+%2F%2F+CLS+%0AU%27+M2%27+U%27+M2%27+U2%27+M2%27+U%27+M2%27+%2F%2F+PLL&setup-alg=L+F+L2+U%27+L+U2+D%27+L+U2+D2+R%27+F2+D2+B2+L2+D2+F2+R+B&title=Forum+Tweak+Example+%28Dark+Mode%0ALucas+Garron%2C+4.88s+PB%0AOctober+20%2C+2020";
contentElem.appendChild(link2);
