import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { motion } from "framer-motion";
import "./AttendanceTable.css";

export function AttendanceTable() {
  const [attendanceData, setAttendanceData] = useState([]);
  const bgcol1 = { backgroundColor: "#43286D", color: "#C1AEC5" };
  const bgcol2 = { backgroundColor: "#C1AEC5", color: "#43286D" };

  useEffect(() => {
    async function fetchAttendanceData() {
      try {
        const subjectCode = "21CS41";
        const attendanceRef = collection(db, "ISE", "attendance", subjectCode);
        const snapshot = await getDocs(attendanceRef);
        const attendanceDocs = snapshot.docs.map((doc) => doc.data());
        setAttendanceData(attendanceDocs);
      } catch (error) {
        console.error("Error fetching attendance data from Firestore", error);
      }
    }

    fetchAttendanceData();
  }, []);

  const getClassCount = () => {
    return attendanceData.length;
  };

  const getAttendanceCount = (sUSN) => {
    return attendanceData.reduce((total, data) => {
      const student = data.attendance.find((student) => student.sUSN === sUSN);
      return total + (student && student.Present ? 1 : 0);
    }, 0);
  };

  const getAttendancePercentage = (attendanceCount, classCount) => {
    return classCount > 0
      ? ((attendanceCount / classCount) * 100).toFixed(2)
      : "N/A";
  };

  return (
    <div
      className="table-responsive"
      style={{ paddingLeft: "5svw", paddingRight: "5svw" }}
    >
      <table>
        <thead>
          <tr>
            <th style={bgcol2}>USN</th>
            <th style={bgcol1}>Name</th>
            <th style={bgcol2}>Classes Held</th>
            <th style={bgcol1}>Classes Attended</th>
            <th style={bgcol2}>Attendance Percentage</th>
            {attendanceData.map((data) => (
              <th
                style={{ backgroundColor: "black" }}
                key={data.date.toMillis()}
              >
                {data.date.toDate().toLocaleDateString()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {attendanceData[0]?.attendance.map((student) => (
            <tr key={student.sUSN}>
              <motion.td
                style={bgcol2}
                initial={{ scale: 1 }}
                transition={{ type: "spring" }}
                whileHover={{ scale: 1.5 }}
              >
                <a
                  style={{ textDecoration: "none", color: "inherit" }}
                  href="https://www.w3schools.com/html/html_links.asp"
                >
                  {" "}
                  {/* make function to send teacher to that student data page on clicking the USN */}
                  {student.sUSN}
                </a>
              </motion.td>
              <motion.td
                style={bgcol1}
                initial={{ scale: 1 }}
                transition={{ type: "spring" }}
                whileHover={{ scale: 1.5 }}
              >
                {student.sName}
              </motion.td>
              <motion.td style={bgcol2}>{getClassCount()}</motion.td>
              <motion.td style={bgcol1}>
                {getAttendanceCount(student.sUSN)}
              </motion.td>
              <motion.td
                style={bgcol2}
                initial={{ scale: 1 }}
                transition={{ type: "spring" }}
                whileHover={{ scale: 1.5 }}
              >
                {getAttendancePercentage(
                  getAttendanceCount(student.sUSN),
                  getClassCount()
                )}
                %
              </motion.td>
              {attendanceData.map((data) => {
                const attendanceRecord = data.attendance.find(
                  (record) => record.sUSN === student.sUSN
                );
                return (
                  <motion.td
                    key={`${data.date.toMillis()}-${student.sUSN}`}
                    className={
                      attendanceRecord.Present
                        ? "attendance-presentt"
                        : "attendance-absentt"
                    }
                  >
                    {attendanceRecord?.Present ? "P" : "A"}
                  </motion.td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
