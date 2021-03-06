import "./AddComments.css";
import React, { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import firebase from "../Firebase/firebase.js";
import { Link } from "react-router-dom";

const AddComments = ({ id, token, fetchBeers, isLoggedIn }) => {
  const [comment, setComment] = useState("");
  const [rate, setRate] = useState(null);
  const [alreadyCommented, setAlreadyCommented] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }
    firebase
      .firestore()
      .collection("Beers")
      .doc(id)
      .get()
      .then((beer) => {
        const comments = beer.data().commentary;
        const found = !!comments.find(
          (comment) => comment.email === token.email
        );
        setAlreadyCommented(found);
      });
  }, [isLoggedIn, id, token]);
  const handleSubmit = (e) => {
    firebase
      .firestore()
      .collection("Beers")
      .doc(id)
      .get()
      .then((beer) => {
        const previousRating = beer.data().rating;
        previousRating.push(rate);

        firebase
          .firestore()
          .collection("Beers")
          .doc(id)
          .update({
            commentary: firebase.firestore.FieldValue.arrayUnion({
              email: token.email,
              text: comment,
            }),
            rating: previousRating,
          })

          .then(() => {
            fetchBeers();
            setAlreadyCommented(true);
          });
      });
    e.preventDefault();
    setComment("");
    setRate(null);
  };
  //Gdy robię input radio display:none, input przestaje jakby działać.
  //Nie moge ustawic walidacji na dwa inputy. Komentarz wystawia bez oceny ale oceny bez komentarza nie.
  //Jeśli jest required w input="radio" wywala błąd "An invalid form control with name='rating' is not focusable."
  //Jak to ogarnąć żeby required był na dwa inputy.
  //Po stronie Firebasa?
  //AddComments.css
  if (isLoggedIn) {
    if (alreadyCommented) {
      return (
        <div className="Input_box">Dodałeś już komentarz do tego piwa</div>
      );
    }
    return (
      <div className="Input__box">
        <form className="Input__box--form" onSubmit={handleSubmit}>
          <div>
            <h3>Oceń i skomentuj</h3>
            {[...Array(5)].map((star, i) => {
              const starValue = i + 1;
              return (
                <label key={i}>
                  <input
                    type="radio"
                    name="rating"
                    required
                    value={starValue}
                    onClick={(e) => setRate(starValue)}
                  />
                  <FaStar
                    size={20}
                    color={starValue <= rate ? "red" : "lightgrey"}
                  />
                </label>
              );
            })}
            <p className="Rating_number">{rate}/5</p>
          </div>
          <textarea
            className="Rating__text"
            type="text"
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          ></textarea>
          <input
            id="name"
            className="Input__submit"
            type="submit"
            value="Dodaj"
          ></input>
        </form>
      </div>
    );
  }
  return (
    <Link to={`/login`}>
      <p className="blueText">ZALOGUJ SIĘ ABY DODAWAĆ KOMENTARZE</p>
    </Link>
  );
};

export default AddComments;
