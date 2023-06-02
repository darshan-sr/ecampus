import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../Backend/Firebase/firebase';
import './AttendanceTable.css';
import FacultyMobileNav from './FacultyMobileNav';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export function AttendanceTable() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('21CS41');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filterOption, setFilterOption] = useState('last7days');

  useEffect(() => {
    async function fetchAttendanceData() {
      try {
        if (selectedSubject) {
          const attendanceRef = collection(db, 'ISE', 'attendance', selectedSubject);
          const snapshot = await getDocs(attendanceRef);
          const attendanceDocs = snapshot.docs.map((doc) => doc.data());
          console.log(attendanceDocs);

          // Apply filter options
          let filteredData = attendanceDocs;
          if (filterOption === 'last7days') {
            filteredData = filteredData.filter((data) => {
              const today = new Date();
              const lastSevenDays = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate() - 7
              );
              const dataDate = data.date.toDate();
              return dataDate >= lastSevenDays && dataDate <= today;
            });
          } else if (filterOption === 'last28days') {
            // Apply similar logic for the last 28 days filter
          } else if (filterOption === 'custom') {
            // Apply custom date range filter using startDate and endDate
            filteredData = filteredData.filter((data) => {
              const dataDate = data.date.toDate();
              return dataDate >= startDate && dataDate <= endDate;
            });
          } else if (filterOption === 'alltime') {
            // Do not apply any date filters
          }

          setAttendanceData(filteredData);
        }
      } catch (error) {
        console.error('Error fetching attendance data from Firestore', error);
      }
    }

    fetchAttendanceData();
  }, [selectedSubject, filterOption, startDate, endDate]);

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
      : 'N/A';
  };

  const subjectOptions = [
    { value: '21CS41', label: '21CS41 (Mathematical Foundations for Computing)' },
    { value: '21CS42', label: '21CS42 (Design and Analysis of Algorithms)' },
    { value: '21CS43', label: '21CS43 (Microcontroller and Embedded System)' },
    { value: '21CS44', label: '21CS44 (Operating System)' },
    { value: '21BE45', label: '21BE45 (Biology for Engineers)' },
    { value: '21UH49', label: 'Universal Human Values' },
  ];

  const handleSubjectChange = (event) => {
    setSelectedSubject(event.target.value);
  };

  // eslint-disable-next-line no-unused-vars
  const exportTableAsCSV = () => {
    const csvRows = [];

    // Prepare header row
    const headerRow = ['USN', 'Name', 'Classes Held', 'Classes Attended', 'Attendance Percentage'];
    attendanceData.forEach((data) => {
      headerRow.push(''+data.date.toDate().toLocaleDateString()+' '+data.sessionTime);
    });
    csvRows.push(headerRow.join(','));

    // Prepare data rows
    attendanceData[0]?.attendance.forEach((student) => {
      const dataRow = [
        student.sUSN,
        student.sName,
        getClassCount(),
        getAttendanceCount(student.sUSN),
        getAttendancePercentage(getAttendanceCount(student.sUSN), getClassCount()),
      ];
      attendanceData.forEach((data) => {
        const attendanceRecord = data.attendance.find(
          (record) => record.sUSN === student.sUSN
        );
        dataRow.push(attendanceRecord?.Present ? 'P' : 'A');
      });
      csvRows.push(dataRow.join(','));
    });

    // Create CSV content
    const csvContent = csvRows.join('\n');

    // Create a temporary <a> element and initiate download
    const link = document.createElement('a');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = 'attendance_data.csv';
    link.click();

    // Clean up temporary URL
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="t-container">
        <FacultyMobileNav />
        <div className="t-filter">
          <div className="subject-dropdown">
            <select
              id="subject"
              value={selectedSubject}
              onChange={handleSubjectChange}
              style={{
                padding: '4px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                maxWidth: '210px',
                fontSize: '16px',
                color: 'black',
                backgroundColor: 'white',
              }}
            >
              <option value="">Select a subject</option>
              {subjectOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-dropdown">
            <select
              value={filterOption}
              onChange={(event) => setFilterOption(event.target.value)}
              style={{
                padding: '4px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                maxWidth: '200px',
                fontSize: '16px',
                color: 'black',
                backgroundColor: 'white',
              }}
            >
              <option value="last7days">Last 7 days</option>
              <option value="last28days">Last 28 days</option>
              <option value="custom">Custom</option>
              <option value="alltime">All Time</option>
            </select>
            {filterOption === 'custom' && (
              <div className="date-picker">
                <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} />
                <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} />
              </div>
            )}
          </div>
        </div>
        <div className="mtable">
          {attendanceData.length > 0 ? (
            <div className="table-container">
              <table style={{ padding: '30px' }}>
                <thead style={{opacity: '1'}}>
                  <tr className="factr" >
                    <th className="facth">USN</th>
                    <th className="facth">Name</th>
                    <th className="facth">Classes Held</th>
                    <th className="facth">Classes Attended</th>
                    <th className="facth">Attendance Percentage</th>
                    {attendanceData.map((data) => (
                      <th className="facth" key={data.date.toMillis()}>
                      <div>
                      {data.date.toDate().toLocaleDateString()}
                      </div>
                      <div >
                        {data.sessionTime}
                      </div>
                      </th>
                    ))}

                  </tr>
                </thead>
                <tbody>
                  {attendanceData[0]?.attendance.map((student) => (
                    <tr className="factr" key={student.sUSN}>
                      <td className="facth">{student.sUSN}</td>
                      <td className="facth" style={{ textAlign: 'left' }}>
                        {student.sName}
                      </td>
                      <td className="facth">{getClassCount()}</td>
                      <td className="facth">{getAttendanceCount(student.sUSN)}</td>
                      <td className="facth">
                        {getAttendancePercentage(
                          getAttendanceCount(student.sUSN),
                          getClassCount()
                        )}
                        %
                      </td>
                      {attendanceData.map((data) => {
                        const attendanceRecord = data.attendance.find(
                          (record) => record.sUSN === student.sUSN
                        );
                        return (
                          <>
                            <td
                              key={`${data.date.toMillis()}-${student.sUSN}`}
                              className="facth"
                            >
                              {attendanceRecord?.Present ? 'P' : 'A'}
                            </td>

                          </>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No data found</p>
          )}
        </div>
        {attendanceData.length > 0 && (
          <button className="exportbutton" onClick={exportTableAsCSV}>
            Export as CSV
          </button>
        )}
      </div>
    </>
  );
}