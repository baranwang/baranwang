import { differenceInYears } from "date-fns";
import type React from "react";

const loadContext = <T>(context: Rspack.Context) => {
	return context.keys().map((key) => context(key) as T);
};

export const INFO = {
	name: {
		zh: "王柄涵",
		en: "Baran",
	},
	phoneDisplay: "+86 175-0212-2111",
	get phone() {
		return this.phoneDisplay.replace(/[- ]/g, "");
	},
	email: "me@baran.wang",
	birthDate: new Date("1993-05-01T12:40:00.000+08:00"),
	careerStartDate: new Date("2014-08-18T00:00:00.000+08:00"),
	get age() {
		return differenceInYears(new Date(), this.birthDate);
	},
	get yearsOfExperience() {
		return differenceInYears(new Date(), this.careerStartDate);
	},
	get workExperience() {
		return loadContext<{
			company: string;
			title: string;
			duration: string;
			default: () => React.JSX.Element;
		}>(
			import.meta.webpackContext("./work-experience", { regExp: /\.mdx$/ }),
		).sort((a, b) => {
			const aStart = new Date(a.duration.split("~")[0].trim());
			const bStart = new Date(b.duration.split("~")[0].trim());
			return bStart.getTime() - aStart.getTime();
		});
	},
	get projectExperience() {
		return loadContext<{
			title: string;
			team: string;
			tags: string[];
			order: number;
			default: () => React.JSX.Element;
		}>(
			import.meta.webpackContext("./project-experience", { regExp: /\.mdx$/ }),
		).sort((a, b) => a.order - b.order);
	},
};
