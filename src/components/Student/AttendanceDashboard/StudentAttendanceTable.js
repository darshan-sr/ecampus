import React, { useContext, useEffect, useRef, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../Backend/Firebase/firebase';
import 'react-datepicker/dist/react-datepicker.css';
import './StudentAttendanceTable.css';
import { useUserAuth } from '../../Backend/context/UserAuthContext'; 
import { doc, getDoc } from 'firebase/firestore';
import { AttendanceContext } from './AttendanceContext';
import DonutChart from './DonutChart';
import { Chart } from 'chart.js/auto';
import 'bootstrap/dist/css/bootstrap.css'
import StudentTopNavbar from '../MobileNav/StudentTopNavbar';

import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';



function StudentAttendanceTable() {
  const { attendanceData, setAttendanceData } = useContext(AttendanceContext);
 
  const { user } = useUserAuth(); 
  const [usn, setUsn] = useState('');

  const getUserData = async (uid) => {
    try { 
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUsn(userData.usn);
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (user) {
    getUserData(user.uid);
  }

  useEffect(() => {
    if (user) {
      getUserData(user.uid);
    }
  }, [user]);

  useEffect(() => {
    async function fetchAttendanceData() {
      try {
        const attendanceRefs = ['21CS41', '21CS42', '21CS43', '21CS44', '21BE45',  '21CS482' ,'21CIP47' , '21UH49','21CSL46','21CSL42','21CSL43'].map((subject) =>
          collection(db, 'ISE', 'attendance', subject)
        );
        const attendanceSnapshots = await Promise.all(attendanceRefs.map((ref) => getDocs(ref)));
        const attendanceDocs = attendanceSnapshots.map((snapshot) => snapshot.docs.map((doc) => doc.data()));
        setAttendanceData(attendanceDocs);
      } catch (error) {
        console.error('Error fetching attendance data from Firestore', error);
      }
    }

    fetchAttendanceData();
  }, [setAttendanceData]);

  const subjectOptions = [
    { value: '21CS41', label: 'Mathematical Foundations for Computing (21CS41)' },
    { value: '21CS42', label: 'Design and Analysis of Algorithms (21CS42)' },
    { value: '21CS43', label: 'Microcontroller and Embedded System (21CS43 )' },
    { value: '21CS44', label: 'Operating System (21CS44)' },
    { value: '21BE45', label: 'Biology for Engineers (21BE45)' },
    { value: '21CIP47', label: 'Constitution of India & Professional Ethics (21CIP47)' },
    { value: '21CS482', label: 'Unix Shell Programming (21CS482)'},
    { value: '21UH49', label: 'Universal Human Values (21UH49)'},
    { value: '21CSL46', label: 'Python Programming Laboratory (21CSL46)' },
    { value: '21CSL42', label: 'Design and Analysis of Algorithms Laboratory' },
    { value: '21CSL43', label: 'Microcontroller and Embedded System Laboratory' },
  ];

  const getAttendanceCount = (subjectIndex) => {
    return attendanceData[subjectIndex].reduce((total, data) => {
      const student = data.attendance?.find((student) => student.sUSN === usn);
      return total + (student && student.Present ? 1 : 0);
    }, 0); 
  };

  const getClassCount = (subjectIndex) => {
    let count = 0;
    attendanceData[subjectIndex].forEach((data) => {
      const student = data.attendance?.find((student) => student.sUSN === usn);
      if (student && (student.Present || student.Absent)) {
        count++;
      }
    });
    return count;
  };

  const getAttendancePercentage = (subjectIndex) => {
    const attendanceCount = getAttendanceCount(subjectIndex);
    const classCount = getClassCount(subjectIndex);
    return classCount > 0 ? ((attendanceCount / classCount) * 100).toFixed(2) : '0';
  };

  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef && chartRef.current) {
      const attendancePercentages = attendanceData.map((data, index) => getAttendancePercentage(index));
  
      const backgroundColors = attendancePercentages.map((percentage) => {
        if (percentage > 75) {
          return 'rgba(127,106,152,1)'; // Green color for attendance above 75
        } else if (percentage > 50) {
          return 'rgba(127,106,152,1)'; // Yellow color for attendance between 50 and 75
        } else {
          return 'rgba(127,106,152,1)'; // Red color for attendance below 50
        }
      });
  
      const ctx = chartRef.current.getContext('2d');
  
      if (chartRef.current.chart) {
        chartRef.current.chart.destroy(); // Destroy the previous chart instance
      }
  
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clear the canvas
  
      chartRef.current.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: subjectOptions.slice(0,9).map((option) => option.value),
          datasets: [
            {
              label: 'Attendance Percentage',
              data: attendancePercentages,
              backgroundColor: backgroundColors,
              borderColor: 'rgba(75, 192, 192, 0.1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                stepSize: 10,
              },
            },
          },
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attendanceData, subjectOptions]);
  

  const totalClassesHeld = attendanceData.reduce((total, data, index) => total + getClassCount(index), 0);

  const totalClassesAttended = attendanceData.reduce((total, data, index) => total + getAttendanceCount(index), 0);

  const totalAttendancePercentage = Math.round((totalClassesAttended / totalClassesHeld) * 100);

  return (
    <>
    <StudentTopNavbar text={'Attendance Dashboard'}/>
    <div className='table-containerrr'>
      <div className="table-containerr">

        <div className="attendance-card">
          <DonutChart totalAttendancePercentage={totalAttendancePercentage} />
          <div style={{alignItems: 'center'}}>
          <h5 style={{marginLeft: '30px', fontSize: '18px', marginBottom: '10px'}}>Attendance Summary</h5>
          <p style={{marginLeft: '30px', marginBottom: '0px', fontSize: '14px'}}>Classes Held: {totalClassesHeld} <br/>  Classes Attended: {totalClassesAttended} <br/>  Classes Absent: {totalClassesHeld-totalClassesAttended} </p>
          </div>

        </div>
        <canvas ref={chartRef} style={{ marginTop: '20px', width: '450px' }}></canvas>
        
        <Tabs style={{marginTop: '20px'}}>
  <TabList>
    <Tab style={{width: '50%',textAlign: 'center'}}>Theory</Tab>
    <Tab style={{width: '50%',textAlign: 'center'}}>Lab</Tab>
  </TabList>

  <TabPanel>
  
        <div style={{ borderRadius: '10px' ,overflow: 'hidden', marginTop: '25px', boxShadow: '2px 2px 2px rgba(0, 0, 0, 0.3)' }}>
          
        <table className="mtable" style={{ }}>
          <thead>
            <tr>
              <th>Subject Code</th>
              <th>Classes Held</th>
              <th>Classes Attended</th>
              <th>Attendance Percentage</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.slice(0, 8).map((data, index) => (
              <tr key={index}>
                <td>{subjectOptions[index].label}</td>
                <td>{getClassCount(index)}</td>
                <td>{getAttendanceCount(index)}</td>
                <td>{Math.round(getAttendancePercentage(index))}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        
        </TabPanel>
        <TabPanel>

        <div style={{ borderRadius: '10px' ,overflow: 'hidden', marginTop: '25px', boxShadow: '2px 2px 2px rgba(0, 0, 0, 0.3)' }}>
        <table className="mtable" style={{}}>
          <thead>
            <tr>
              <th>Subject Code</th>
              <th>Classes Held</th>
              <th>Classes Attended</th>
              <th>Attendance Percentage</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.slice(-3).map((data, index) => (
              <tr key={index}>
                <td>{subjectOptions[subjectOptions.length - 3 + index]?.label}</td>
                <td>{getClassCount(subjectOptions.length - 3 + index)}</td>
                <td>{getAttendanceCount(subjectOptions.length - 3 + index)}</td>
                <td>{Math.round(getAttendancePercentage(subjectOptions.length - 3 + index))}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        </TabPanel>
        </Tabs>
        
        </div>
      </div>
    </>
  );
}

export default StudentAttendanceTable;
