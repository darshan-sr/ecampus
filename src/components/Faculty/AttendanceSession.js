import { useState, useEffect } from "react";
import StudentCard from "./StudentCard";
import data from "./data";
import { setDoc, doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "../Backend/Firebase/firebase";
import "./AttendanceSession.css";
import success from "../Images/success.png";
import { useUserAuth } from "../Backend/context/UserAuthContext";
import "bootstrap/dist/css/bootstrap.css";
import FacultyMobileNav from "./FacultyMobileNav";
import StudentTopNavbar from "../Student/MobileNav/StudentTopNavbar";
import MoveToTop from "./MoveToTop";

export default function AttendanceSession() {
  const [attendance, setAttendance] = useState(data);
  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);
  const [, setIsSubmitted] = useState(false); // isSubmitted is not used
  const [progress, setProgress] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState(null); 
  const [selectedSession, setSelectedSession] = useState(null);
  const [subjects, setSubjects] = useState({});
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isLabSubject, setIsLabSubject] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  const { user } = useUserAuth();

  const getUserData = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setSubjects(userData.subject);
        console.log(userData.subject)
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user) {
      getUserData(user.uid);
    }
  }, [user]);

  const updateFirestore = async () => {
    let presentCount = 0;
    let absentCount = 0;
    selectedBatch ? attendance.filter((student) => student.Batch === Number(selectedBatch)).forEach((student) => {
      if (student.Present) {
        presentCount++;
      } else {
        absentCount++;
      }})   
    : attendance.forEach((student) => {
      if (student.Present) {
        // presentCount++;
      } else {
        absentCount++;
      }
    });


    if (attendance.length > 0 && presentCount > 0) {
      try {
        setPresentCount(presentCount);
        setAbsentCount(absentCount);
        setIsSubmitted(true);

        const subjectCode = selectedSubject;
        const sessionTime = selectedSession;
        const Time = new Date().toISOString();

        const newAttendanceDoc = {
          date: Timestamp.now(),
          attendance: selectedBatch
            ? attendance
                .filter((student) => student.Batch === Number(selectedBatch))
                .map((student) => ({
                  sName: student.sName,
                  sUSN: student.sUSN,
                  Present: student.Present,
                }))
            : attendance.map((student) => ({
                sName: student.sName,
                sUSN: student.sUSN,
                Present: student.Present,
              })),
          presentCount: presentCount,
          absentCount: absentCount,
          updatedBy: user.displayName,
          sessionTime: sessionTime,
          Batch: selectedBatch ? selectedBatch : 'theory',
        };

        await setDoc(
          doc(db, "ISE", "attendance", subjectCode, Time),
          newAttendanceDoc
        );
        console.log("Attendance Recorded Successfully");
        setProgress(2);
      } catch (error) {
        console.error("Error writing to Firestore", error);
      }
    }
  };

  function toggleAttendance(usn) {
    setAttendance((prevAttendance) => {
      return prevAttendance.map((student) => {
        if (student.sUSN === usn) {
          return { ...student, Present: !student.Present };    
        } else {
          return student;
        }
      });
    });
  }


  const batchOptions = [
    {value: '1' , label: 'Batch 1'},
    {value: '2' , label: 'Batch 2'},
    {value: '3' , label: 'Batch 3'},
  ]

  const sessionOptions = [
    { value: "9:00am - 10:00am", label: "9:00am - 10:00am (Theory)" },
    { value: "10:00am - 11:00am", label: "10:00am -11:00am (Theory)" },
    { value: "11:20am - 12:20pm", label: "11:20am - 12:20pm (Theory)" },
    { value: "12:20pm - 1:20pm", label: "12:20pm - 1:20pm (Theory)" },
    { value: "2:00pm - 3:00pm", label: "2:00pm - 3:00pm (Theory)" },
    { value: "3:00pm - 4:00pm", label: "3:00pm - 4:00pm (Theory)" },
    { value: "9:00am - 11:00am", label: "9:00am - 11:00am (Lab)" },
    { value: "2:00pm - 4:00pm", label: "2:00pm - 4:00pm (Lab)" },
    
  ];
 
  const handleSubjectChange = (event) => {
    setSelectedSubject(event.target.value);
    handleLabSelection(event.target.value); // Call handleLabSelection function here
  };

  const handleSessionChange = (event) => {
    setSelectedSession(event.target.value);
  };

  const handleBatchChange = (event) => { 
    setSelectedBatch(event.target.value);
  };

  const AllstudentCards = attendance.map((student) => (
    <StudentCard
      key={student.sUSN}
      img={student.Image}
      USN={student.sUSN}
      Name={student.sName}
      Present={student.Present}
      toggle={() => toggleAttendance(student.sUSN)}
    />
  ));

  const Batch1studentCards = attendance.map((student) => (
    <>
      {student.Batch === 1 && (
        <StudentCard
          key={student.sUSN}
          img={student.Image}
          USN={student.sUSN}
          Name={student.sName}
          Present={student.Present}
          toggle={() => toggleAttendance(student.sUSN)}
        />
      )}
    </>
  ));

  const Batch2studentCards = attendance.map((student) => (
    <>
      {student.Batch === 2 && (
        <StudentCard
          key={student.sUSN}
          img={student.Image}
          USN={student.sUSN}
          Name={student.sName}
          Present={student.Present}
          toggle={() => toggleAttendance(student.sUSN)}
        />
      )}
    </>
  ));

  const Batch3studentCards = attendance.map((student) => (
    <>
      {student.Batch === 3 && (
        <StudentCard
          key={student.sUSN}
          img={student.Image}
          USN={student.sUSN}
          Name={student.sName}
          Present={student.Present}
          toggle={() => toggleAttendance(student.sUSN)}
        />
      )}
    </>
  ));
 

  function handleLabSelection (subjectcode){
    
   if(subjectcode === '21CSL46'||subjectcode === "21CSL42"||subjectcode === "21CSL43"){
    setIsLabSubject(true);
   }
   else{
    setIsLabSubject(false);
    setSelectedBatch(null);
   }
    
  }


  function ConfirmationModal({ isOpen, onClose, absentStudents }) {
    let presentCount = 0;
    let absentCount = 0;
    selectedBatch ? attendance.filter((student) => student.Batch === Number(selectedBatch)).forEach((student) => {
      if (student.Present) {
        presentCount++;
      } else {
        absentCount++;
      }})   
    : attendance.forEach((student) => {
      if (student.Present) {
        presentCount++;
      } else {
        absentCount++;
      }
    });


    return (
      <div className={`modal ${isOpen ? "open" : ""}`}>
        <div className="modal-content">
          <h4>Confirm Attendance Submission</h4>
          <p>Are you sure you want to submit attendance?</p>
          <p>Students Present: {presentCount}</p>
          <p>Students Absent: {absentCount}</p>
          <p>List of Absent Students:</p>
          <div className="modal-absentees">
            <ul style={{ listStyle: "none", fontSize: "15px" }}>
              {absentStudents.map((student) => (
                <li key={student.sUSN}>{student.sName}</li>
              ))}
            </ul>
          </div>
          <div className="modal-buttons">
            <button onClick={onClose}>Cancel</button>
            <button onClick={updateFirestore}>Submit</button>
          </div>
        </div>
      </div>
    );
  }

  function submitAttendance() {
    setIsConfirmationModalOpen(true);
  }

  const stepOne = (
    <div className="step1-body">
      <div style={{ zIndex: "-1" }} className="step1-container">
        <h4 style={{ paddingBottom: "10px", textAlign: "center" }}>
          Create New Session
        </h4>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ width: "360px" }}>
            <div className="subject-dropdown">
              <p
                htmlFor="subject"
                style={{
                  paddingBottom: "1px",
                  marginBottom: "3px",
                  paddingTop: "20px",
                }}
              >
                Choose Subject:
              </p>
              <select
                value={selectedSubject}
                onChange={handleSubjectChange}
                className="sub-dropdown"
              >
                <option value="">Select a subject</option>
                {subjects && Object.entries(subjects).length > 0 ? (
                  Object.entries(subjects).map(([key, value]) => (
                    <option key={key} value={key}>
                      {`${key} (${value})`}
                    </option>
                  ))
                ) : (
                  <option disabled>No subjects available</option>
                )}
              </select>
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "15px",
            marginBottom: "50px",
          }}
        >
          <div style={{ width: "360px" }}>
            <p
              htmlFor="sessionSelect"
              style={{
                paddingBottom: "1px",
                marginBottom: "3px",
                paddingTop: "15px",
              }}
            >
              Choose Session Time:
            </p>
            <select
              id="sessionSelect"
              value={selectedSession}
              onChange={handleSessionChange}
              className="sub-dropdown"
            >
              <option value="">Select Session time:</option>
              {sessionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLabSubject && (<div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "10px",
            marginBottom: "50px",
          }}
        >
          <div style={{ width: "360px" }}>
            <p
              htmlFor="sessionSelect"
              style={{
                paddingBottom: "1px",
                marginBottom: "3px",
                paddingTop: "15px",
              }}
            >
              Choose Batch:
            </p>
            <select
              id="sessionSelect"
              value={selectedBatch}
              onChange={handleBatchChange}
              className="sub-dropdown"
            >
              <option value="">Select Batch:</option>
              {batchOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>)}

        <button
          className="submitAttendance"
          disabled={!selectedSubject || !selectedSession}
          onClick={() => {
            setProgress(1);
          }}
        >
          Next
        </button>
      </div>
    </div>
  );

  const stepTwo = (


    <>
      <div className="mainContainer" style={{ overflow: "hidden" }}>
        <h3 style={{ paddingBottom: "10px", textAlign: "center" }}>
          Mark Attendance
        </h3>
        <h6
          style={{
            paddingBottom: "10px",
            marginLeft: "20px",
            marginRight: "20px",
            textAlign: "center",
            fontWeight: "400",
            color: "#777",
          }}
        >
          Default All the Students are Marked as Present, Please tap on the
          cards to make changes, confirm the Absentees and submit the form.{" "}
        </h6>
        {selectedBatch === null && AllstudentCards}
        {selectedBatch === "1" && Batch1studentCards }
        {selectedBatch === "2" && Batch2studentCards }
        {selectedBatch === "3" && Batch3studentCards}
        

        {attendance.length > 0 && presentCount === 0 && (
          <div className="buttonContainer">
            {progress > 0 && (
              <button
                className="multibutton"
                onClick={() => {
                  setProgress(progress - 1);
                }}
              >
                Previous
              </button>
            )}
            <button
              className="multibutton"
              onClick={() => {
                submitAttendance();
              }}
            >
              Submit
            </button>
          </div>
        )}
      </div>
      <MoveToTop />
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        presentCount={presentCount}
        absentCount={absentCount}
        absentStudents={attendance.filter((student) => !student.Present)}
      />
    </>
  );

  const stepThree = (
    
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {updateFirestore ? (
        <>
          <img src={success} alt="Success" style={{ maxHeight: "150px" }} />
          <h4 style={{ paddingBottom: "10px", textAlign: "center" }}>
            Attendance Recorded
          </h4>


          {presentCount > 0 && (
            <p>
              {presentCount}/{presentCount+absentCount} Present
            </p>
          )}
          {absentCount > 0 && (
            <p>
              {absentCount}/{presentCount+absentCount} Absent
            </p>
          )}

          
          <button
            className="submitAttendance"
            onClick={() => {
              setProgress(0);
            }}
          >
            Return Home
          </button>
        </>
      ) : (
        <>
          <h4 style={{ paddingBottom: "10px", textAlign: "center" }}>
            Failed to Record Attendance
          </h4>
          <p>
            There was an error while submitting the attendance. Please try
            again.
          </p>
          <button
            className="submitAttendance"
            onClick={() => {
              setProgress(0);
            }}
          >
            Return Home
          </button>
        </>
      )}
    </div>
  );

  return (
    <>
      <StudentTopNavbar text={"Attendance"} />
      <FacultyMobileNav />
      {progress === 0 && stepOne}
      <div className="containerr" style={{ paddingTop: "95px" }}>
        {progress === 1 && stepTwo}
        {progress === 2 && stepThree}
      </div>
    </>
  );
}
