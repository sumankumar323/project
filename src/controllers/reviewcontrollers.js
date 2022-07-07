



//........................**********------------ DELETE books by reviewsId------*******............ 
 
const deleteBooksByreviewId = async (req,res) => {
    try {
      let reviewId = req.params.reviewId;
      let findreviewId = await reviewmodel.findById({ bookId: _id }) //checking that bookid present inside database or not
      if (!findreviewId) return res.status(404).send({ status: false, msg: "No reviewId Found" });
      await reviewmodel.findOneAndUpdate(
        {_id:  bookId, isDeleted: false },
        { new: true }
      );
      res.status(200).send({ status: true, data: "book is deleted" });
      
    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

