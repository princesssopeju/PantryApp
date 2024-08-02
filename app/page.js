"use client";
import { Box, Stack, Typography, Button, TextField, Modal } from "@mui/material";
import { firestore } from "./firebase";
import { collection, getDocs, query, doc, setDoc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '100%',
  maxWidth: 400,
  bgcolor: '#FFC0CB',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
  borderRadius: '8px',
};

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export default function Home() {
  const [pantry, setPantryList] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPantry, setFilteredPantry] = useState([]);
  const [isClient, setIsClient] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const updatePantry = async () => {
    const q = query(collection(firestore, "pantry"));
    const querySnapshot = await getDocs(q);
    const pantryList = [];
    querySnapshot.forEach((doc) => {
      pantryList.push({ name: doc.id, count: doc.data().count });
    });
    setPantryList(pantryList);
    setFilteredPantry(pantryList);
  };

  useEffect(() => {
    setIsClient(true);
    updatePantry();
  }, []);

  const addItem = async (item) => {
    try {
      const normalizedItem = item.toLowerCase();
      const docRef = doc(collection(firestore, 'pantry'), normalizedItem);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        await updateDoc(docRef, {
          count: docSnap.data().count + 1
        });
      } else {
        await setDoc(docRef, { count: 1 });
      }

      updatePantry();
      handleClose();
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const removeItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'pantry'), item.name.toLowerCase());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const currentCount = docSnap.data().count;
        if (currentCount > 1) {
          await updateDoc(docRef, {
            count: currentCount - 1
          });
        } else {
          await deleteDoc(docRef);
        }
      }

      updatePantry();
    } catch (error) {
      console.error("Error removing document: ", error);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query === "") {
      setFilteredPantry(pantry);
    } else {
      const filtered = pantry.filter(item => item.name.includes(query.toLowerCase()));
      setFilteredPantry(filtered);
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
      bgcolor={'#FFEBEF'}
      p={2}
      pt={16}
      pb={18}
    >
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        gap={1} 
        width="100%" 
        maxWidth="400px"
        mb={2}
      >
        <TextField
          id="search"
          label="Search Pantry"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          fullWidth
          sx={{ bgcolor: '#fff', borderRadius: '4px' }}
        />
        <Button 
          variant="contained" 
          onClick={handleOpen} 
          sx={{ 
            bgcolor: '#FF69B4', 
            '&:hover': { bgcolor: '#FF1493' },
            color: '#fff',
            fontWeight: 'bold',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            fontSize: '0.75rem',
            padding: '4px 8px',
            mt: 0.5
          }}
        >
          Add
        </Button>
      </Box>
      <Box 
        border={'1px solid #ccc'} 
        width="100%" 
        maxWidth="550px" // Slightly increased the width
        borderRadius={'6px'} 
        boxShadow={'0 4px 8px rgba(0, 0, 0, 0.1)'} 
        mt={1}
        display="flex"
        flexDirection="column"
        alignItems="center"
        overflow="hidden"
      >
        <Box
          width="100%"
          height="60px"
          bgcolor={'#FFB6C1'}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
          borderBottom={'1px solid #ccc'}
          sx={{ borderRadius: '6px 6px 0 0' }}
        >
          <Typography variant={'h5'} color={'#333'} textAlign={'center'} fontWeight={'bold'}>
            Pantry Items
          </Typography>
        </Box>
        <Box
          sx={{
            width: "100%",
            maxHeight: "350px", // Increased height for more visible items
            overflowY: "auto", // Enable vertical scrolling
            overflowX: "hidden", // Disable horizontal scrolling
          }}
        >
          <Stack
            width="100%"
            spacing={2}
            padding={2}
          >
            {filteredPantry.length > 0 ? filteredPantry.map((item) => (
              <Box
                key={item.name}
                width="90%"
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}
                bgcolor={'#f8f8f8'}
                border={'1px solid #eee'}
                borderRadius={4}
                p={1}
                boxShadow={'0 2px 4px rgba(0, 0, 0, 0.1)'}
                mx="auto"
              >
                <Box display={'flex'} flexDirection={'column'} justifyContent={'center'}>
                  <Typography variant={'h6'} color={'#333'} fontWeight={'bold'}>
                    {capitalizeFirstLetter(item.name)}
                  </Typography>
                  <Typography variant={'body2'} color={'#666'}>
                    Quantity: {item.count}
                  </Typography>
                </Box>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  onClick={() => removeItem(item)} 
                  sx={{
                    bgcolor: '#FFB6C1',
                    '&:hover': { bgcolor: '#FF69B4' },
                    padding: '4px 4px',
                    fontSize: '0.775rem',
                    color: '#fff',
                    fontWeight: 'bold',
                    borderRadius: '6px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  Remove
                </Button>
              </Box>
            )) : (
              <Typography variant={'h6'} color={'#333'} textAlign={'center'} fontWeight={'bold'}>
                No items found
              </Typography>
            )}
          </Stack>
        </Box>
      </Box>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <TextField
            id="item-name"
            label="Item Name"
            variant="outlined"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            fullWidth
          />
          <Button 
            variant="contained" 
            onClick={() => addItem(itemName)} 
            sx={{ 
              bgcolor: '#FF69B4', 
              '&:hover': { bgcolor: '#FF69B4' },
              color: '#fff',
              fontWeight: 'bold',
              borderRadius: '6px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              fontSize: '0.75rem',
              padding: '4px 4px',
              mt: 0.5
            }}
          >
            Add
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}
