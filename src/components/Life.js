import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar';

const Life = () => {
  const [boxSize, setBoxSize] = useState(10);
  const [boxCount, setBoxCount] = useState(55);
  const [rowCount, setRowCount] = useState(55);
  const [matrix, setMatrix] = useState([]);
  const [lastTick, setLastTick] = useState(1000);
  const [tick, setTick] = useState(2147000000);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [paused, setPaused] = useState(true);
  const [toggle, setToggle] = useState('transparent');
  const [gens, setGens] = useState(0);
  const [liveCount, setLiveCount] = useState(0);
  const theme = useSelector((state) => state.theme);
  const navOpen = useSelector((state) => state.navOpen);


  useEffect(() => {
    setTimeout(() => {
      document.getElementsByClassName('fade-cover')[0].classList.add('fade-out');
    }, 100); // this code controls the fade out transition when going from main page to the life game
    const updateLayout = () => {
      const screenWidth = window.screen.width;
      const screenHeight = window.screen.height;
      let windowHeight = window.innerHeight;
      let windowWidth = window.innerWidth;
      let bs = boxSize || Math.max(screenWidth, screenHeight) * 0.005; // Each box is .05% of the screen width
      if (screenWidth < 900 || screenHeight < 900) bs *= 2; // boxs are bigger on mobile
      const newBoxCount = Math.floor(Math.min(windowWidth, screenWidth) / bs);
      const newRowCount = Math.floor(Math.min(windowHeight, screenHeight) / bs);
      setBoxSize(bs);
      setBoxCount(newBoxCount * 3);
      setRowCount(newRowCount * 3);
    };

    window.addEventListener('resize', updateLayout);

    updateLayout(); // Initial call to set up layout

    // Cleanup event listener on component unmount
    return () => window.removeEventListener('resize', updateLayout);
  }, [boxCount, rowCount, boxSize]);

  const newMatrix = () => {
    console.log('making fresh matrix....')
    setMatrix(Array.from({ length: rowCount }).map(() => (
      Array.from({ length: boxCount }).fill(0))
    ))
    setLiveCount(0)
  }

  useEffect(() => {
    // starting matrix
    if (boxSize === 10 ) newMatrix()
  }, [rowCount, boxCount])

  const handleClick = (rowIndex, colIndex) => {
    if (matrix[rowIndex][colIndex] === 0) {
      let l = liveCount + 1;
      setLiveCount(l)
    }
    setMatrix(prevMatrix =>
      prevMatrix.map((row, rIndex) =>
        row.map((cell, cIndex) =>
          rIndex === rowIndex && cIndex === colIndex
            ? cell = 1 : cell
            // cell === 0 ? 1 : 0 : cell // this code switches live cells to dead and dead cells to live
        )
      )
    );
  };

  const nextGen = () => {
    const m = matrix;
    let newMatrix = Array.from({ length: rowCount }, () => []);

    const cellUpdate = (r, c) => {
      let neighbors = 0;
      let upLeft = (r > 0 && c > 0) ? m[r - 1][c - 1] : 0;
      let up = (r > 0) ? m[r - 1][c] : 0;
      let upRight = (r > 0 && c < m[0].length - 1) ? m[r - 1][c + 1] : 0;
      let left = (c > 0) ? m[r][c - 1] : 0;
      let right = (c < m[0].length - 1) ? m[r][c + 1] : 0;
      let downLeft = (r < m.length - 1 && c > 0) ? m[r + 1][c - 1] : 0;
      let down = (r < m.length - 1) ? m[r + 1][c] : 0;
      let downRight = (r < m.length - 1 && c < m[0].length - 1) ? m[r + 1][c + 1] : 0;
      neighbors += upLeft
      neighbors += up
      neighbors += upRight
      neighbors += left
      neighbors += right
      neighbors += down
      neighbors += downLeft
      neighbors += downRight

      if (m[r][c] === 0) {
        if (neighbors === 3) {
          return [1,1] // dead cell comes alive, cell count ++
        } else {
          return [0,0] // dead cell stays dead, cell count += 0
        }
      }
      if (m[r][c] === 1 && (neighbors > 3 || neighbors < 2)) {
        return [0,-1] // cell dies, cell count --
      }
      return [1,0]
    }

    let l = liveCount;
    for (let row = 0; row < rowCount; row++) {
      newMatrix[row] = [];
      for (let col = 0; col < boxCount; col++) {
        let cell = cellUpdate(row, col);
        l += cell[1];
        newMatrix[row].push(cell[0]);
      }
    }

    setMatrix(newMatrix);
    setLiveCount(l);
    let g = gens + 1;
    setGens(g);
  }
// button controls
  const speedUp = () => {
    let t = lastTick;
    if (lastTick <= 5) {
      return
    } else if (lastTick <= 50) {
      setLastTick(t - 5)
if (!paused)       setTick(t - 5);
    } else if (lastTick <= 100) {
      setLastTick(t - 10)
      if (!paused) setTick(t - 10);
    } else {
      setLastTick(t - 100)
      if (!paused) setTick(t - 100);
    }
  }
  const slowDown = () => {
    let t = lastTick;
    if (lastTick < 50) {
      setLastTick(t + 5)
      if (!paused) setTick(t + 5);
    } else if (lastTick < 100) {
      setLastTick(t + 10)
      if (!paused) setTick(t + 10);
    } else {
      setLastTick(t + 100)
      if (!paused) setTick(t + 100);
    }
  }
  const pause = () => {
    let p = paused;
    if (!p) {
      setLastTick(tick);
      setTick(2147000000)
    } else {
      setTick(lastTick)
    }
    setPaused(!p)
  }
  const clear = () => {
    if (tick < 2147000000) {
      setLastTick(tick);
      setTick(2147000000);
    }
    if (!paused) setPaused(true)
    if (gens > 0) {
      setGens(0)
    }
    if (liveCount > 0 || liveCount < 0 /*error case*/) {
      setLiveCount(0)
      newMatrix()
    }
  }
  // click and drag handlers
  const handleMouseDown = () => {
    setIsMouseDown(true);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseMove = (rowIndex, colIndex) => {
    if (isMouseDown) {
      handleClick(rowIndex, colIndex);
    }
  };
  // Touch event handlers
  const handleTouchStart = () => {
    setIsMouseDown(true);
  };

  const handleTouchEnd = () => {
    setIsMouseDown(false);
  };

  const handleTouchMove = (event, rowIndex, colIndex) => {
    // Get the first touch point
    const touch = event.touches[0];
    // Get the touch coordinates relative to the viewport
    let x = touch.clientX;
    let y = touch.clientY;
    x = Math.floor(x/boxSize)
    y = Math.floor(y/boxSize)

    if (isMouseDown) {
      handleClick(y, x);
    }
  };

  const toggleGrid = () => {
    if (toggle === 'transparent') {
      setToggle('grey')
    } else {
      setToggle('transparent')
    }
  }
///////////// Testing new functionality here
  const boxSizeUp = () => {
    let b = boxSize * 1.5;
    setBoxSize(b)
  }
  const boxSizeDown = () => {
    let b = boxSize * .75;
    setBoxSize(b)
  }
////////////
  useEffect(() => {
    const intervalId = setInterval(nextGen, tick);
    return () => clearInterval(intervalId);
  }, [tick, matrix]);

  return (
    <div className={theme} style={{ display: "flex", flexDirection: "row", width: "100vw" }}>
      <Navbar/>
      <div className="main-content">
        <div className='gridLife' style={ { marginLeft: navOpen ? '5%' : '8%' }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          // onMouseMove={(e) => handleMouseMove(rowIndex, colIndex)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        onTouchMove={() => handleTouchMove(event)}
        >
          <div className="fade-cover"></div>
          {matrix.map((row, rowIndex) => (
           rowIndex >= (rowCount / 3) && rowIndex <= (rowCount / 3 * 2) && (
            <div key={rowIndex} style={{ display: 'flex' }}>
              {row.map((cell, colIndex) => (
                colIndex >= (boxCount / 3) && colIndex <= (boxCount / 3 * 2) && (
                <div
                  key={colIndex}
                  style={{
                    width: boxSize + 'px',
                    height: boxSize + 'px',
                    backgroundColor: cell === 0 ? (theme === 'light' ? 'white' : 'black') : (theme === 'light' ? 'black' : 'white'),
                    boxSizing: 'border-box',
                    border: `.1px solid ${toggle}`,
                  }}
                  onClick={() => handleClick(rowIndex, colIndex)}
                  onMouseMove={() => handleMouseMove(rowIndex, colIndex)}
                  onTouchMove={() => handleTouchMove(event,rowIndex, colIndex)}
                >
                  {/* cell content here */}
                </div>
                )
              ))}
            </div>
          )
          ))}
          <div className='controls'>
            <div style={{ flex: 1, flexDirection: 'row', display: 'flex', justifyContent: 'space-around' }}>
              <Button  onClick={clear}>Clear</Button>
              <Button  onClick={nextGen}>+1 Gen</Button>
              <Button  onClick={speedUp}>&#9650;</Button>
              <Button  onClick={slowDown}>&#9660;</Button>
              <Button id={`arrowButton${paused}`} onClick={pause}>{`>`}||</Button>
              <Button  onClick={toggleGrid}>#</Button>
              <Button  onClick={boxSizeUp}>b^</Button>
              <Button  onClick={boxSizeDown}>bv</Button>
            </div>
              <div className='info'>
                <span>Generations: {gens}</span>
                <span>Live Cells: {liveCount}</span>
                Speed: {`${Math.round((1000/lastTick)*100)/100} gen/ sec`}
                </div>
          </div>
        </div>
      </div>
    </div>
  )
};

export default Life;

