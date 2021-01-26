import React from 'react'
import styled from 'styled-components'
import { NavLink } from 'react-router-dom'
import { PRESALE_POOL_INFO } from '../../state/presale/hooks'
import { useActiveWeb3React } from '../../hooks'
import logo from '../../assets/images/coin/source/ZERO.png'


const PresalePoolBox = styled.div`
  flex-wrap: wrap;
  width: 100%;
  margin-top: 20px;
`
function toDateTime(secs) {
  var t = new Date(Date.UTC(1970, 0, 1)); // Epoch
  t.setUTCSeconds(secs);
  return t;
}

export default function FarmsList() {
  const { chainId, account } = useActiveWeb3React()
  const tokenList = PRESALE_POOL_INFO[chainId].sort(x =>x.poolId);
  return (
    <>
      <PresalePoolBox>
        <div className='row'>
        {tokenList.map(({ earnToken, 
        isActive, poolAddress, 
        poolId, projectLink, 
        startTime, projectName,price,capacity }, index) => {
         
         return (
           
           <div className="col-lg-4 col-md-4" key={index}>
             <div className="card">
               <div className="card-header" style={{textAlign:'center'}}>
               <img src={logo} width='200px' />
                 <h4 className="card-title">{projectName}</h4>
                </div>
               <div className="card-body">
               
                 <p className="card-text">Symbol: <span style={{float:'right'}}>{earnToken.symbol}</span></p>
                 <p className="card-text">Price: <span style={{float:'right'}}>{price} HT</span></p>
                 <p className="card-text">Capacity: <span style={{float:'right'}}>{capacity} {earnToken.symbol}</span></p>
                 <p className="card-text">date: <span style={{float:'right'}}>{startTime}</span></p>
                 <p className="card-text"><a href={projectLink} target={'_blank'}>{'Project link'}</a></p>
                 {isActive ? 
                    <NavLink to={'/presale/sale?token=' + poolAddress} className="btn btn-primary" style={{width: '100%'}}>
                              Buy
                    </NavLink>
                    : 
                      <button className="btn btn-warning" style={{width: '100%'}} disabled>In Active</button>
                 }
                 
               </div>
             </div>
           </div>
   
         )
       })}
        </div>
     
      </PresalePoolBox>
    </>
  )
}
