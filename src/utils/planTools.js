import { universities } from "./staticAssistData";

export function sortCourses(courseArray) {
  const copy = [...courseArray];

  copy.sort((a, b) => {
    // put series at end
    if (a.isSeries && !b.isSeries) return 1;
    if (!a.isSeries && b.isSeries) return -1;
    if (a.isSeries && b.isSeries) return 0;

    if (a.prefix < b.prefix) return -1;
    if (a.prefix > b.prefix) return 1;

    return a.number.localeCompare(b.number, undefined, { numeric: true });
  });

  return copy;
}

export function getUniName(fyId) {
  const university = universities.find((uni) => uni.id === Number(fyId));

  if (university) {
    return university.name;
  } else {
    return null;
  }
}

export function createInstructions(requiredCourses) {
  if (requiredCourses.length < 2) {
    return "";
  } else if (requiredCourses.length === 2) {
    return "Complete A and B";
  } else if (requiredCourses.length > 2) {
    let instructions = "";

    for (let i = 0; i < requiredCourses.length; i++) {
      const currentReq = requiredCourses[i];

      if (currentReq.courses.length > 1) {
        const progressiveLetter = String.fromCharCode(i + 1 + 64);

        if (i === 0) {
          instructions = "Complete";
        } else if (i !== requiredCourses.length - 1) {
          instructions += ` ${progressiveLetter}, `;
        } else {
          instructions += ` and ${progressiveLetter}`;
        }
      }
    }

    return instructions;
  }
}

export function removeDupes(reqsList) {
  const uniGroups = groupByUni(reqsList);

  for (let i = 0; i < uniGroups.length; i++) {
    const knownIds = new Set();
    const majorReqs = uniGroups[i];

    for (let j = 0; j < majorReqs.length; j++) {
      const { requirements } = majorReqs[j];

      for (let k = 0; k < requirements.length; k++) {
        const req = requirements[k];

        for (let l = 0; l < req.requiredCourses.length; l++) {
          const { courses, type, amount } = req.requiredCourses[l];

          const initialLength = courses.length;

          for (let m = 0; m < courses.length; m++) {
            const currentCourse = courses[m];

            const id = currentCourse.courseId || currentCourse.seriesId;

            if (!knownIds.has(id)) {
              knownIds.add(id);
            } else {
              courses.splice(m, 1);
              m--;

              if (
                type === "NCourses" &&
                courses.length === initialLength - amount
              ) {
                courses.splice(0, courses.length);
              }
            }
          }
        }
      }
    }
  }

  return uniGroups.flat();
}

export function generateCourseGroupKey(courseGroup, groupIndex) {
  const coursesKey = courseGroup.courses
    .map((course) => course.courseId || course.seriesTitle)
    .join("-");

  return `group-${coursesKey}-${groupIndex}`;
}

export function generateRequirementKey(requirementObj, index) {
  const courseIds = requirementObj.requiredCourses
    .flatMap((group) => group.courses)
    .map((course) => course.courseId || course.seriesTitle)
    .join("-");

  return `req-${courseIds}-${index}`;
}

export function findArticulation(course, articulations) {
  const idToFind = course.courseId || course.seriesId;

  const noYearCourseId = idToFind.split("_")[0];

  for (let i = 0; i < articulations.length; i++) {
    const { articulatedCourses } = articulations[i];

    for (let j = 0; j < articulatedCourses.length; j++) {
      const articulationId =
        articulatedCourses[j].courseId || articulatedCourses[j].seriesId;

      if (noYearCourseId === articulationId) {
        return articulatedCourses[j];
      }
    }
  }
}

export function groupByUni(reqsList) {
  const newReqsList = [];
  const fyIds = new Set();

  for (let i = 0; i < reqsList.length; i++) {
    const { inputs } = reqsList[i];

    fyIds.add(inputs.fyId);
  }

  for (const id of fyIds) {
    const filtered = reqsList.filter((req) => req.inputs.fyId === id);

    newReqsList.push(filtered);
  }

  return newReqsList;
}
