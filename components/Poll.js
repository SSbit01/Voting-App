import Link from "next/link";
import {useRouter} from "next/router";
import {useState, useEffect, useRef} from "react";
import {useForm, useFieldArray, useWatch} from "react-hook-form";
import {motion, AnimatePresence} from "framer-motion";
import Chart from "chart.js/auto";
import useUser from "../lib/useUser";
import Figure from "./Figure";
import PlusMinus from "./PlusMinus";


export default function Poll({_id="", q, original_options={}, new_options={}, closed, created, figure}) {
  const maxLength = 50;

  const api = `/api/poll/${_id}`;

  const {user} = useUser();

  const router = useRouter();

  const {control, register, handleSubmit, formState: {isDirty, isValid}} = useForm({mode: "onChange"});

  const {fields, append, remove} = useFieldArray({
    control,
    name: "new_options"
  });

  const [newOptions, setNewOptions] = useState(Object.keys(new_options));

  const watchNew_options = useWatch({
    control,
    name: "new_options"
  });

  const [stateClosed, setStateClosed] = useState(closed);

  const [dropdown, setDropdown] = useState(false);

  const [vote, setVote] = useState(undefined);

  const [chart, setChart] = useState(undefined);

  const [votes, setVotes] = useState(Object.values(original_options).concat(Object.values(new_options)).reduce((a, b) => a+b, 0));

  const [disable, setDisable] = useState(false);

  const canvas = useRef(null);

  useEffect(() => {
    setChart(new Chart(
      canvas.current.getContext("2d"),
      {
        type: "pie",
        data: {
          labels: Object.keys(original_options).concat(newOptions),
          datasets: [{
            label: "Chart",
            data: Object.values(original_options).concat(Object.values(new_options)),
            backgroundColor: ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5']
          }]
        },
        options: {
          elements: {
            arc: {
              borderWidth: 0
            }
          }
        }
      },
    ));
  }, []);

  useEffect(() => chart && (() => chart.destroy()), [chart]);

  useEffect(() => user && setVote(user?.votes[_id]), [user]);

  const pageVariants = {
    in: {
      opacity: 0,
      translateY: "-1em",
      scale: .8
    },
    out: {
      opacity: 1,
      translateY: 0,
      scale: 1
    }
  }

  function dropdownOnClick() {
    if (user?.name === figure?.name) {
      setDropdown(!dropdown);
    }
  }

  function dropdownOnBlur() {
    setDropdown(false);
  }

  function closePoll() {
    if (user?.name === figure?.name) {
      if (confirm(`Are you sure to ${stateClosed ? "open" : "close"} this poll?`)) {
        setDisable(true);
        fetch(api, {
          method: "PATCH",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({closed: !stateClosed})
        }).then(r => r.json()).then(res => {
          setDisable(false);
          if (res?.ok) {
            if (stateClosed) {
              alert("Poll has been opened");
              setStateClosed(false);
            } else {
              remove();
              alert("Poll has been closed");
              setStateClosed(true);
            }
          } else {
            alert(JSON.stringify(res));
          }
        });
      }
    }
  }

  function deletePoll() {
    if (user?.name === figure?.name) {
      if (confirm("Are you sure to delete this poll?")) {
        setDisable(true);
        fetch(api, {
          method: "DELETE"
        }).then(r => r.json()).then(res => {
          if (res?.ok) {
            alert("Poll has been deleted");
            router.push(`/user/${user.name}`);
          } else {
            alert(JSON.stringify(res));
            setDisable(false);
          }
        });
      }
    }
  }

  function sendNewOptions(obj) {
    if (user?.name) {
      setDisable(true);
      const mappedNew_options = obj.new_options.map(f => f.value);
      const body = JSON.stringify({new_options: mappedNew_options});
      fetch(api, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body
      }).then(r => r.json()).then(res => {
        setDisable(false);
        if (res?.ok) {
          remove();
          setNewOptions(previousOptions => [...previousOptions, ...mappedNew_options]);
          for (let i of mappedNew_options) {
            chart.data.labels.push(i);
            chart.data.datasets.forEach(dataset => {
              dataset.data.push(0);
            });
          }
          chart.update();
        } else {
          alert("An error occurred");
        }
      });
    }
  }

  function Vote(option) {
    setDisable(true);
    fetch(api, {
      method: "PATCH",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({option, changeVote: true})
    }).then(r => r.json()).then(res => {
      setDisable(false);
      if (res?.ok) {
        const {labels} = chart.data;
        let new_votes_num = votes;
        if (option) {
          const i = labels.indexOf(option);
          chart.data.datasets.forEach(dataset => {
            dataset.data[i]++;
          });
          new_votes_num++;
        }
        if (vote) {
          const i = labels.indexOf(vote);
          chart.data.datasets.forEach(dataset => {
            dataset.data[i]--;
          });
          new_votes_num--;
        }
        chart.update();
        if (new_votes_num !== votes) {
          setVotes(new_votes_num);
        }
        setVote(option);
      } else {
        alert(JSON.stringify(res));
      }
    });
  }

  return (
    <div className={"relative p-1 m-2 border rounded shadow " + (stateClosed ? "bg-gray-800 text-white" : "bg-gray-300 border-gray-400")}>
      <p className="absolute left-2">{stateClosed ? "Closed" : "Open"}</p>
      {user?.name === figure?.name &&
        <div className="absolute right-1 flex flex-col items-end gap-1.5">
          <button className="bg-transparent text-current p-0 px-1.5 pb-0.5 text-2xl float-right hover:bg-transparent" id="dropdown_button" onClick={dropdownOnClick} onBlur={dropdownOnBlur} disabled={disable}>≡</button>
          <AnimatePresence>
            {dropdown &&
              <motion.div initial="in" animate="out" exit="in" variants={pageVariants} transition={{duration: .2}} className="menu-items">
                {[[stateClosed ? "Open" : "Close", closePoll, "hover:bg-gray-900"], ["Delete", deletePoll, "hover:bg-red-600"]].map((arr, i) => (
                  <button key={i} className={arr[2]} onClick={arr[1]} disabled={disable}>{arr[0]}</button>
                ))}
              </motion.div>
            }
          </AnimatePresence>
        </div>
      }
      <h1 className="text-center">{q}</h1>
      {[
        ["Original Options", Object.keys(original_options), false], ["New Options", newOptions, !stateClosed && (user?.name ?  // Child
          <form className="border-none shadow-none p-0 gap-2 bg-transparent" onSubmit={handleSubmit(sendNewOptions)}>
            {fields.map((data, i) => (
              <input key={data.id} defaultValue={data.value} type="text" maxLength={maxLength} placeholder="Option" {...register(`new_options.${i}.value`, {
                required: true,
                maxLength,
                validate() {
                  const arr = watchNew_options.map(f => f.value).concat(chart?.data?.labels);
                  return new Set(arr).size === arr.length;
                }
              })} disabled={stateClosed || disable}/>
            ))}
            <PlusMinus plus={() => append({value: ""})} minus={() => remove(fields.length-1)} disabled_plus={stateClosed || disable} disabled_minus={stateClosed || !fields.length || disable}/>
            <button className="button2" disabled={!isDirty || !isValid || !fields.length || stateClosed|| disable}>Create New Option(s)</button>
          </form>
        : <p className="text-center">You must <Link href="/login">log in</Link><br/>If you want to add new options</p>)]
      ].map((arr, i) => {
        if ((arr[1].length && stateClosed) || !stateClosed) {
          return (
            <fieldset key={i} className="m-2">
              <legend>{arr[0]}</legend>
              <div className={`flex flex-col gap-1.5 none-if-empty ${arr[2] && "mb-4"}`}>
                {arr[1].map((o, i) => {
                  const isTheVote = vote === o;
                  return (
                    <button key={i} className={"text-left" + (isTheVote && " bg-blue-900")} disabled={stateClosed || disable} onClick={() => Vote(!isTheVote && o)}>
                      <span className="float-left">{o}</span>
                      {isTheVote &&
                        <span className="float-right">✔</span>
                      }
                    </button>
                  );
                })}
              </div>
              {arr[2]}
            </fieldset>
          );
        }
      })}
      <div className="flex items-center justify-between gap-6 m-3">
        {figure?.img && <Figure {...figure}/>}
        <p>{new Date(created).toLocaleDateString()}</p>
      </div>
      <h2 className="text-center">{votes} vote(s)</h2>
      <canvas className="max-w-xs" ref={canvas}/>
      <p className="text-center mt-2"><Link href={`/poll/${_id}`}>{_id}</Link></p>
    </div>
  );
}